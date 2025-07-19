import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  ComboboxItem,
  Group,
  Select,
  TextInput,
  Tooltip,
  useMantineTheme,
  Text,
  LoadingOverlay,
} from '@mantine/core';

import {
  setCurrentCohortId,
  createNewCohort,
  removeCohort,
  updateCohortName,
  loadCohortsFromStorage,
} from './CohortManagerSlice';
import {
  selectAllCohorts,
  selectCurrentCohort,
  selectCohortManagerLoading,
  selectCohortManagerUninitialized,
  selectCohortManagerError,
} from './CohortManagerSelectors';
import { useDeepCompareEffect } from 'use-deep-compare';
import { useAppDispatch, useAppSelector } from '../appApi';
import {
  Cohort,
  DataAccessRequestUserInformation,
  IndexResourceField,
  isIndexedFilterSetEmpty,
  SupportServiceConfiguration,
} from '../types';
import {
  UploadIcon,
  AddIcon,
  DownloadIcon,
  CloseIcon,
} from '../../../types/icons';

import { Icon } from '@iconify-icon/react';

import { IconSize } from '../../../utils/sizes';
import { modals } from '@mantine/modals';
import DataAccessRequestForm from '../Requests/DataAccessRequestForm';
import { submitCohortRequestAction } from '../Requests/submitCohortRequestAction';
import {
  selectUserDetails,
  useCoreSelector,
  useCreateRequestMutation,
  useLazyGetAggsNoFilterSelfQuery,
} from '@gen3/core';
import { ErrorCard } from '../../../components/MessageCards';

interface CohortManagerProps {
  indexResources: IndexResourceField;
  remoteSupportService: SupportServiceConfiguration;
  size?: string;
}

const hasExportImport = false;

const CohortManagerPanel = ({
  indexResources,
  remoteSupportService,
  size = 'md',
}: CohortManagerProps) => {
  const appDispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editingLabel, setEditingLabel] = useState('');
  const allCohorts: Array<Cohort> = useAppSelector(selectAllCohorts);
  const currentCohort = useAppSelector(selectCurrentCohort);

  const [getGetAggs] = useLazyGetAggsNoFilterSelfQuery();
  const [requestQuery] = useCreateRequestMutation();
  const user = useCoreSelector(selectUserDetails);

  const theme = useMantineTheme();
  const iconSize = IconSize[size] || IconSize['sm'];
  const startEditing = () => {
    setIsEditing(true);
    setEditingLabel(currentCohort.name);
  };

  const hasNoFilters = currentCohort
    ? isIndexedFilterSetEmpty(currentCohort?.filters)
    : true;

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingLabel('');
  };

  const saveEdit = () => {
    if (editingLabel.trim() === '' || !currentCohort.name) return;

    appDispatch(updateCohortName({ id: currentCohort.id, name: editingLabel }));
    setIsEditing(false);
    setEditingLabel('');
  };

  const handleCreateNew = () => {
    appDispatch(createNewCohort({ name: 'New Cohort' }));
  };

  const selectData = useMemo(() => {
    return allCohorts.map((cohort: Cohort) => ({
      label: cohort.name,
      value: cohort.id,
    }));
  }, [allCohorts]);

  useDeepCompareEffect(() => {
    if (!currentCohort) {
      setCurrentCohortId(allCohorts[0].id);
    }
  }, [allCohorts, currentCohort, setCurrentCohortId]);

  const onSelectCohort = useCallback(
    (_value: unknown, option: ComboboxItem | null) => {
      if (option) {
        appDispatch(setCurrentCohortId(option.value));
      }
    },
    [appDispatch],
  );

  const handleCohortAccessRequest = async (
    cohortId: string,
    values: DataAccessRequestUserInformation,
  ) => {
    const cohort = allCohorts.find((obj) => obj.id === cohortId);

    if (cohort)
      await submitCohortRequestAction(
        cohort,
        values,
        user,
        indexResources,
        remoteSupportService,
        appDispatch,
        getGetAggs,
        requestQuery,
      );
  };

  return (
    <Group gap="xs" className="flex pt-4 pl-2">
      {!isEditing ? (
        <Group>
          <Select
            data={selectData}
            value={currentCohort?.id ?? null}
            onChange={onSelectCohort}
          />
          <Tooltip label="Rename selected cohort" position="bottom" withArrow>
            <Button
              variant="action"
              color="secondary.4"
              onClick={startEditing}
              title={`Rename ${currentCohort?.name}`}
              data-testid="renameCohort"
              aria-label="Rename cohort"
              size={`compact-${size}`}
            >
              <Icon icon="gen3:edit" height={iconSize} width={iconSize} />
            </Button>
          </Tooltip>
        </Group>
      ) : (
        <Group gap="xs">
          <TextInput
            value={editingLabel}
            onChange={(e) => setEditingLabel(e.target.value)}
            placeholder="Enter new name"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && editingLabel.trim()) saveEdit();
              if (e.key === 'Escape') cancelEditing();
            }}
            autoFocus
            style={{ flex: 1 }}
          ></TextInput>
          <Tooltip label="Apply rename" position="bottom" withArrow>
            <Button
              variant="action"
              color="secondary.4"
              onClick={saveEdit}
              data-testid="completeCohortRenameButton"
              aria-label="Complete rename cohort"
              disabled={
                editingLabel.trim() === '' ||
                editingLabel.trim() === currentCohort?.name
              }
              size={`compact-${size}`}
            >
              <Icon icon="gen3:check" height={iconSize} width={iconSize} />
            </Button>
          </Tooltip>
          <Tooltip label="Cancel rename" position="bottom" withArrow>
            <Button
              variant="action"
              data-testid="cancelRenameButton"
              aria-label="Cancel rename cohort"
              color={theme.colors.accent[4]}
              onClick={cancelEditing}
              size={`compact-${size}`}
            >
              <CloseIcon size="1.5em" aria-hidden="true" />
            </Button>
          </Tooltip>
        </Group>
      )}
      <Tooltip label="Create a new cohort" position="bottom" withArrow>
        <Button
          size={`compact-${size}`}
          data-testid="addButton"
          aria-label="Add cohort"
          variant="action"
          color="secondary.4"
          onClick={handleCreateNew}
        >
          <AddIcon size="1.5em" aria-hidden="true" />
        </Button>
      </Tooltip>
      <Tooltip label="Delete selected cohort" position="bottom" withArrow>
        <Button
          size={`compact-${size}`}
          data-testid="uploadButton"
          aria-label="Upload cohort"
          variant="action"
          onClick={() => {
            modals.openConfirmModal({
              title: `Delete Cohort: ${currentCohort?.name}`,
              centered: true,
              children: (
                <Text size="sm">
                  Are you sure you want to delete your cohort? Deleted cohorts
                  cannot be restored.{' '}
                  {currentCohort?.requests?.length > 0
                    ? `This cohort has ${currentCohort?.requests?.length} requests. Deleting this cohort will results in not being able to correlate nay pending requests.
                    Are you sure you want to delete this cohort?.`
                    : ''}
                </Text>
              ),
              labels: { confirm: 'Delete Cohort', cancel: 'Cancel' },
              confirmProps: { color: theme.colors.accent[4] },
              onConfirm: () => {
                appDispatch(removeCohort(currentCohort.id));
              },
            });
          }}
        >
          <Icon icon="gen3:delete" height={iconSize} width={iconSize} />
        </Button>
      </Tooltip>
      <Tooltip
        label={
          hasNoFilters
            ? 'No Filters defined. Cannot submit request.'
            : 'Submit Data Access Request'
        }
        position="bottom"
        withArrow
      >
        <Button
          size={`compact-${size}`}
          data-testid="cohortManager-requestCohortAccessButton"
          aria-label="Request cohort access"
          variant="action"
          disabled={hasNoFilters}
          onClick={() => {
            const modelId = modals.open({
              title: 'DATA ACCESS REQUEST',
              children: (
                <DataAccessRequestForm
                  cohortId={currentCohort.id}
                  submitFunction={handleCohortAccessRequest}
                  close={() => modals.close(modelId)}
                />
              ),
            });
          }}
        >
          <Icon icon="gen3:request" height={iconSize} width={iconSize} />
        </Button>
      </Tooltip>
      {hasExportImport ? (
        <>
          <Tooltip label="Import Cohort" position="bottom" withArrow>
            <Button
              size={`compact-${size}`}
              data-testid="uploadButton"
              aria-label="Upload cohort"
              variant="action"
            >
              <UploadIcon size="1.5em" aria-hidden="true" />
            </Button>
          </Tooltip>
          <Tooltip label="Export Cohort" position="bottom" withArrow>
            <span>
              <Button
                size={`compact-${size}`}
                data-testid="downloadButton"
                aria-label="Download cohort"
                variant="action"
              >
                <DownloadIcon size="1.5em" aria-hidden="true" />
              </Button>
            </span>
          </Tooltip>
        </>
      ) : null}
    </Group>
  );
};

const CohortManager = ({
  indexResources,
  remoteSupportService,
  size = 'md',
}: CohortManagerProps) => {
  // TODO: initialize and load cohorts from cohort storage
  //  as right now the redux-persist is handling cohorts
  return (
    <CohortManagerPanel
      indexResources={indexResources}
      remoteSupportService={remoteSupportService}
      size={size}
    />
  );
};

export default CohortManager;
