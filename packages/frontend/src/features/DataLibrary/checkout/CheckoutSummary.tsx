import React, { useCallback, useMemo, useState } from 'react';
import type { ComboboxItem } from '@mantine/core';
import {
  Button,
  Divider,
  Group,
  Paper,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { Icon } from '@iconify-icon/react';
import { notifications } from '@mantine/notifications';
import type { FileItem } from '@gen3/core';
import { HTTPError, HTTPUserFriendlyErrorMessages } from '@gen3/core';
import { useDeepCompareMemo } from 'use-deep-compare';
import type { MRT_RowSelectionState } from 'mantine-react-table-open';
import { useDataLibrarySelection } from '../selection/SelectionContext';
import CheckoutFilesTable from '../tables/CheckoutFilesTable';
import {
  doesGroupFailRule,
  doesItemFailRule,
  getActionById,
} from '../selection/selectedItemActions';
import type { ActionCreatorFactoryItem } from '../selection/registeredActions';
import { findAction, NullAction } from '../selection/registeredActions';
import type { ValidatedSelectedItem } from '../types';
import type {
  DataLibraryActionConfig,
  DataLibraryActionsConfig,
} from '../selection/types';
import { filesize } from 'filesize';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  colorClass?: string;
  borderColorClass?: string;
}

interface CheckoutFileStats {
  totalFilesCount: number;
  totalFilesSize: number;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  colorClass = 'bg-accent-lighter',
  borderColorClass = 'border-accent',
}) => (
  <Paper
    className={`flex-1 ${colorClass} border ${borderColorClass} px-8 py-6`}
    radius="sm"
    withBorder={false}
  >
    <Text
      fw={600}
      size="sm"
      tt="uppercase"
      className={`${colorClass}-contrast`}
    >
      {label}
    </Text>
    <Text
      fw={700}
      size="xl"
      className={`${colorClass}-contrast leading-none mt-1`}
    >
      {value}
    </Text>
    {unit && (
      <Text size="sm" className={`${colorClass}-contrast leading-none mt-1`}>
        {unit}
      </Text>
    )}
  </Paper>
);

interface ActionFunctionWithParams extends ActionCreatorFactoryItem {
  parameters?: Record<string, unknown>;
}

export interface CheckoutSummaryProps {
  actions: DataLibraryActionsConfig;
  onBack?: () => void;
  size?: string;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  actions,
  onBack,
  size = 'sm',
}) => {
  const [value, setValue] = useState<ComboboxItem | null>(null);
  const { gatheredItems } = useDataLibrarySelection();
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [actionFunction, setActionFunction] =
    useState<ActionFunctionWithParams>({ action: NullAction });
  const [actionConfig, setActionConfig] =
    useState<DataLibraryActionConfig | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const fileSummary = useMemo(
    () =>
      gatheredItems.reduce(
        (acc, item) => {
          if (item.itemType === 'Data') {
            const fileItem = item satisfies FileItem;
            return {
              totalFilesSize: acc.totalFilesSize + Number(fileItem.size ?? 0),
              totalFilesCount: acc.totalFilesCount + 1,
            };
          }
          return acc;
        },
        { totalFilesCount: 0, totalFilesSize: 0 } satisfies CheckoutFileStats,
      ),
    [gatheredItems],
  );

  const { totalFilesCount, totalFilesSize } = fileSummary;

  const destinations = useMemo(
    () => actions.map((action) => ({ label: action.label, value: action.id })),
    [actions],
  );

  const selectedCount = Object.keys(rowSelection).length;

  const selectedItems = useMemo(
    () =>
      gatheredItems.filter((_, index) => Object.hasOwn(rowSelection, index)),
    [gatheredItems, rowSelection],
  );

  const selectedSize = useMemo(() => {
    const sizes = selectedItems
      .map((item) => {
        if ('size' in item && item.size) {
          const match = String(item.size).match(/^([\d.]+)/);
          return match ? parseInt(match[1]) : 0;
        }
        return 0;
      })
      .filter(Boolean);
    if (sizes.length === 0) return '--';
    const total = sizes.reduce((sum, s) => sum + s, 0);
    return filesize(total);
  }, [selectedItems]);

  const onError = (error: HTTPError | Error) => {
    setIsRunning(false);
    console.warn('Error running action:', error);
    if (error instanceof HTTPError) {
      notifications.show({
        id: 'checkout-action-error',
        position: 'top-center',
        withCloseButton: true,
        autoClose: 5000,
        title: 'Action Error',
        message: HTTPUserFriendlyErrorMessages[error.status],
        color: 'red',
        icon: <Icon icon="gen3:error-outline" />,
        loading: false,
      });
    }
  };

  const onDone = () => {
    setIsRunning(false);
    notifications.show({
      id: 'checkout-action-done',
      position: 'top-center',
      withCloseButton: true,
      autoClose: 5000,
      title: 'Submission Complete',
      message: actionConfig
        ? `${actionConfig.label} completed successfully`
        : 'Completed successfully',
      loading: false,
    });
  };

  const setSelectionAction = useCallback(
    (actionId: string) => {
      const config = getActionById(actions, actionId);
      if (config) {
        setActionConfig(config);
        const action = findAction(config.actionFunction);
        if (action)
          setActionFunction({
            action: action.action,
            parameters: config.parameters,
          });
        return;
      }
      setActionFunction({ action: NullAction });
    },
    [actions],
  );

  const validatedLibrarySelections =
    useDeepCompareMemo((): ReadonlyArray<ValidatedSelectedItem> => {
      const action = getActionById(actions, value?.value);
      if (!action)
        return gatheredItems.map((item) => ({ ...item, valid: undefined }));

      const selectedActionItems = gatheredItems.filter((_, index) =>
        Object.hasOwn(rowSelection, index),
      );
      const groupFailsRule = doesGroupFailRule(selectedActionItems, action);
      return gatheredItems.map((item, index) => {
        if (rowSelection[index]) {
          const itemFailsRule = doesItemFailRule(item, action);
          const messages = [...itemFailsRule, ...groupFailsRule];
          if (messages.length > 0)
            return { ...item, valid: false, errorMessages: messages };
          return { ...item, valid: true };
        }
        return { ...item, valid: undefined };
      });
    }, [gatheredItems, rowSelection, actions, value]);

  const sendDisabled =
    actionFunction.action === NullAction ||
    validatedLibrarySelections.length === 0 ||
    validatedLibrarySelections.some((x) => x.valid === false);

  const displayTotalCount =
    totalFilesCount !== undefined ? totalFilesCount : gatheredItems.length;
  const displaySelectedCount = selectedCount > 0 ? selectedCount : '--';
  const displaySelectedSize = selectedSize ?? '-- MB';

  return (
    <div className="flex flex-col w-full px-4 py-4">
      <Group gap="xs" align="center" className="mb-1">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            className="flex items-center justify-center w-9 h-9 rounded hover:bg-base-light transition-colors"
          >
            <Icon
              icon="gen3:back"
              width={24}
              height={24}
              className="text-secondary"
            />
          </button>
        )}
        <Text fw={700} size="xl" c="secondary.5" className="text-heading">
          Checkout Summary
        </Text>
      </Group>

      <Divider my="xs" />

      <Stack gap="md" mt="sm">
        <Text size="sm" className="text-base-contrast">
          Review your selected files before exporting or requesting access.
          Open-access files can be exported directly, while controlled-access
          files require an approval request.
        </Text>

        <Group grow gap="md">
          <StatCard
            label="Total Files"
            value={displayTotalCount}
            unit={filesize(totalFilesSize)}
            colorClass="bg-accent-light"
            borderColorClass="border-accent"
          />
          <StatCard
            label="Selected Files"
            value={displaySelectedCount}
            unit={displaySelectedSize}
            colorClass="bg-accentWarm-lighter"
            borderColorClass="border-accentWarm"
          />
        </Group>

        <Paper withBorder radius="sm" p="md" className="border-base-light">
          <Text fw={700} size="sm">
            Status - Authorization Required
          </Text>
          <Text size="sm">
            Open-access files can be exported immediately to your workspace.
            Controlled-access files require an access request that will be
            reviewed by the platform administrator.
          </Text>
        </Paper>

        <div>
          <div className="bg-accent-light border border-b-0 border-base-light rounded-t-sm px-3 py-1 flex items-center gap-2">
            <Icon
              icon="gen3:collapse"
              width={16}
              height={16}
              className="text-base-contrast"
            />
            <Text fw={700} size="sm">
              Files
            </Text>
          </div>
          <CheckoutFilesTable items={validatedLibrarySelections} size={size} />
        </div>

        <Paper
          withBorder
          radius="sm"
          p="md"
          className="border-base-light rounded-t-none"
        >
          <Group justify="space-between" align="center">
            <Group gap="sm" align="center">
              <Text fw={600} size="sm">
                Destination
              </Text>
              <Select
                data={destinations}
                value={value ? value.value : null}
                placeholder="Choose a destination"
                comboboxProps={{ zIndex: 500 }}
                w={284}
                onChange={(val, option) => {
                  setValue(option);
                  if (val) setSelectionAction(val);
                  else setActionFunction({ action: NullAction });
                }}
              />
            </Group>
            <Button
              loading={isRunning}
              disabled={sendDisabled}
              rightSection={
                actionConfig?.rightIcon ? (
                  <Icon icon={actionConfig.rightIcon} />
                ) : undefined
              }
              onClick={async () => {
                setIsRunning(true);
                await actionFunction.action(
                  validatedLibrarySelections,
                  actionFunction.parameters,
                  onDone,
                  onError,
                );
              }}
            >
              {actionConfig ? actionConfig.buttonLabel : 'Send'}
            </Button>
          </Group>
        </Paper>
      </Stack>
    </div>
  );
};

export default CheckoutSummary;
