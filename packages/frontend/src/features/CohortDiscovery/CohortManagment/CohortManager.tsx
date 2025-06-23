import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  ComboboxItem,
  Group,
  Select,
  TextInput,
  Tooltip,
  Loader,
  LoadingOverlay,
  ActionIcon,
  useMantineTheme,
  Text,
} from '@mantine/core';
import { Operation } from '@gen3/core';
import {
  setCurrentCohortId,
  createNewCohort,
  saveCohortToStorage,
  deleteCohortFromStorage,
  removeCohort,
  updateCohortName,
} from './CohortManagerSlice';
import {
  selectAllCohorts,
  selectCurrentCohort,
  selectSavedCohorts,
  selectUnsavedCohorts,
  selectModifiedUnsavedCohorts,
  selectCohortManagerLoading,
  selectCohortManagerError,
  selectAutoSaveInProgress,
  selectCohortAutoSaveStatus,
} from './CohortManagerSelectors';
import { AppState, useAppDispatch, useAppSelector } from '../appApi';
import { Cohort } from '../types';
import {
  UploadIcon,
  AddIcon,
  DeleteIcon,
  DownloadIcon,
  CloseIcon,
} from '../../../types/icons';

import { Icon } from '@iconify/react';

import { IconSize } from '../../../utils/sizes';
import { modals } from '@mantine/modals';

interface CohortManagerProps {
  size?: string;
}

const hasExportImport = false;

export const CohortManager = ({ size = 'md' }: CohortManagerProps) => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editingLabel, setEditingLabel] = useState('');
  const allCohorts = useAppSelector(selectAllCohorts);
  const currentCohort = useAppSelector(selectCurrentCohort);
  const savedCohorts = useAppSelector(selectSavedCohorts);
  const unsavedCohorts = useAppSelector(selectUnsavedCohorts);
  const modifiedUnsavedCohorts = useAppSelector(selectModifiedUnsavedCohorts);
  const loading = useAppSelector(selectCohortManagerLoading);
  const autoSaveInProgress = useAppSelector(selectAutoSaveInProgress);

  const theme = useMantineTheme();
  const iconSize = IconSize[size] || IconSize['sm'];
  const startEditing = () => {
    setIsEditing(true);
    setEditingLabel(currentCohort.name);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingLabel('');
  };

  const saveEdit = () => {
    if (editingLabel.trim() === '' || !currentCohort.name) return;

    dispatch(updateCohortName({ id: currentCohort.id, name: editingLabel }));
    setIsEditing(false);
    setEditingLabel('');
  };

  const currentCohortAutoSaving = useAppSelector((state: AppState) =>
    selectCohortAutoSaveStatus(state, currentCohort.id),
  );

  const handleCreateNew = () => {
    dispatch(createNewCohort({ name: 'New Cohort' }));
  };

  const handleSaveCohort = () => {
    const cohortId = currentCohort?.id;
    if (!cohortId) {
      dispatch(saveCohortToStorage({ cohortId }));
    }
  };

  const handleSaveAsCohort = () => {
    const cohortId = currentCohort?.id;
    if (!cohortId) {
      dispatch(saveCohortToStorage({ cohortId }));
    }
  };

  const selectData = useMemo(() => {
    return allCohorts.map((cohort: Cohort) => ({
      label: cohort.name,
      value: cohort.id,
    }));
  }, [allCohorts]);

  const handleDeleteCohort = (cohortId: string) => {
    const cohort = allCohorts.find((c: Cohort) => c.id === cohortId);
    if (cohort?.saved) {
      dispatch(deleteCohortFromStorage(cohortId));
    } else {
      dispatch(removeCohort(cohortId));
    }
  };

  const handleRenameCohort = (name: string) => {
    const cohortId = currentCohort?.id;
    if (cohortId) {
      dispatch(updateCohortName({ id: cohortId, name }));
    }
  };

  const handleSelectCohort = (cohortId: string) => {
    dispatch(setCurrentCohortId(cohortId));
  };

  const onSelectCohort = useCallback(
    (_value: unknown, option: ComboboxItem | null) => {
      if (option) {
        dispatch(setCurrentCohortId(option.value));
      }
    },
    [dispatch],
  );

  if (loading) {
    return <div>Loading cohorts...</div>;
  }

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
                editingLabel.trim() === currentCohort.name
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
              title: 'Delete Cohort',
              centered: true,
              children: (
                <Text size="sm">
                  Are you sure you want to delete your cohort? Deleted cohorts
                  cannot be restored.
                </Text>
              ),
              labels: { confirm: 'Delete Cohort', cancel: 'Cancel' },
              confirmProps: { color: theme.colors.utility[2] },
              onConfirm: () => {
                dispatch(removeCohort(currentCohort.id));
              },
            });
          }}
        >
          <Icon icon="gen3:delete" height={iconSize} width={iconSize} />
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

export default CohortManager;
