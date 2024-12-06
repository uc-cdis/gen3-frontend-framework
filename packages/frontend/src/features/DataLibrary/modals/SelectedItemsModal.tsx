import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Group,
  Modal,
  ComboboxItem,
  ModalProps,
  Stack,
  Select,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Icon } from '@iconify/react';
import { HTTPError } from '@gen3/core';
import { HTTPUserFriendlyErrorMessages } from './utils';

import SelectedItemsTable from '../tables/SelectedItemsTable';
import {
  getActionById,
  doesItemFailRule,
  doesGroupFailRule,
} from '../selection/selectedItemActions';
import { useDeepCompareMemo } from 'use-deep-compare';
import { useDataLibrarySelection } from '../selection/SelectionContext';
import { MRT_RowSelectionState } from 'mantine-react-table';
import { ValidatedSelectedItem } from '../types';
import {
  DataLibraryActionsConfig,
  DataLibraryActionConfig,
} from '../selection/types';
import {
  ActionCreatorFactoryItem,
  findAction,
  NullAction,
} from '../selection/registeredActions';

const ModalHeader = () => {
  return (
    <div className="flex justify-between items-center">
      <Text fw={600} className="text-heading">
        Retrieve Data
      </Text>
    </div>
  );
};

const bindAction = (action: DataLibraryActionConfig) => {
  const actionFunction = findAction(action.actionFunction);
  if (!actionFunction) {
    return NullAction;
  }
  return actionFunction.action;
};

interface SelectedItemsModelProps extends ModalProps {
  actions: DataLibraryActionsConfig;
}

interface ActionFunctionWithParams extends ActionCreatorFactoryItem {
  parameters?: Record<string, any>;
}

const SelectedItemsModal: React.FC<SelectedItemsModelProps> = (props) => {
  const [value, setValue] = useState<ComboboxItem | null>(null);
  const { actions } = props;
  const { gatheredItems } = useDataLibrarySelection();
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [actionFunction, setActionFunction] =
    useState<ActionFunctionWithParams>({ action: NullAction });
  const [actionConfig, setActionConfig] =
    useState<DataLibraryActionConfig | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const destinations = useMemo(() => {
    return actions.map((action) => {
      return { label: action.label, value: action.id };
    });
  }, [actions]);

  const onError = (error: HTTPError | Error) => {
    setIsRunning(false);
    if (error instanceof HTTPError) {
      notifications.show({
        id: 'data-library-selection-action-error',
        position: 'bottom-center',
        withCloseButton: true,
        autoClose: 5000,
        title: 'Action Error',
        message: HTTPUserFriendlyErrorMessages[error.status],
        color: 'red',
        icon: <Icon icon="gen3:outline-error" />,
        loading: false,
      });
    }
  };

  const onDone = (arg?: string) => {
    setIsRunning(false);
    notifications.show({
      id: 'data-library-selection-action-done',
      position: 'bottom-center',
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
      const actionConfig = getActionById(actions, actionId);
      if (actionConfig) {
        setActionConfig(actionConfig);
        const action = bindAction(actionConfig);
        if (action)
          setActionFunction({
            action: action,
            parameters: actionConfig.parameters,
          });
        return;
      }
      setActionFunction({ action: NullAction });
    },
    [actions],
  );

  const validatedLibrarySelections =
    useDeepCompareMemo((): ReadonlyArray<ValidatedSelectedItem> => {
      // get the action
      const action = getActionById(actions, value?.value);
      // if there are no actions then everything is valid
      if (!action)
        return gatheredItems.map((item) => {
          return { ...item, valid: undefined };
        });
      // get all selected items
      const selectedActionItems = gatheredItems.filter((_, index) =>
        Object.hasOwn(rowSelection, index),
      );
      // apply group rules of action if any fail then add error message and set flag
      const groupFailsRule = doesGroupFailRule(selectedActionItems, action);
      const validItems = gatheredItems.map((item, index) => {
        if (rowSelection[index]) {
          // if selected then validate item rules
          const itemFailsRule = doesItemFailRule(item, action);

          const itemAndGroupTestMessages = [
            ...itemFailsRule,
            ...groupFailsRule,
          ];
          if (itemAndGroupTestMessages.length > 0)
            return {
              ...item,
              valid: false,
              errorMessages: itemAndGroupTestMessages,
            };

          // defaults return true
          return { ...item, valid: true };
        } // no selection so all items are valid
        else return { ...item, valid: undefined };
      });

      return validItems;
    }, [gatheredItems, rowSelection, actions, value]);

  const actionButtonDisabled =
    actionFunction.action === NullAction ||
    validatedLibrarySelections.length === 0 ||
    validatedLibrarySelections.some((x) => x.valid === false);

  return (
    <Modal
      {...props}
      closeOnEscape
      centered
      withinPortal={false}
      title={<ModalHeader />}
      classNames={{
        header: 'm-0 p-2 min-h-10 bg-primary-lightest',
        content: 'scroll-smooth',
      }}
      overlayProps={{ opacity: 0.5 }}
    >
      <Stack>
        <SelectedItemsTable
          validatedItems={validatedLibrarySelections}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
        <Group justify="space-between">
          <Group>
            <Text fw={600}>Destination:</Text>
            <Select
              data={destinations}
              value={value ? value.value : null}
              onChange={(value, option) => {
                setValue(option);
                if (value) setSelectionAction(value);
                else setActionFunction({ action: NullAction });
              }}
            />
          </Group>
          <Button
            loading={isRunning}
            rightSection={
              actionConfig?.rightIcon ? (
                <Icon icon={actionConfig?.rightIcon} />
              ) : undefined
            }
            disabled={actionButtonDisabled}
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
            {actionConfig ? actionConfig.buttonLabel : 'Submit'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default SelectedItemsModal;
