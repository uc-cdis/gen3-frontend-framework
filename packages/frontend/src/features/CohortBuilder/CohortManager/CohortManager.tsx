import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  ComboboxItem,
  Group,
  Select,
  Text,
  TextInput,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';

import {
  Cohort,
  createNewCohort,
  duplicateCohort,
  isIndexedFilterSetEmpty,
  removeCohort,
  selectAllCohorts,
  selectCurrentCohort,
  setCurrentCohortId,
  updateCohortName,
  useCoreDispatch,
  useCoreSelector,
} from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';

import {
  AddIcon,
  CloseIcon,
  CopyIcon,
  DownloadIcon,
  UploadIcon,
} from '../../../types/icons';

import { Icon } from '@iconify-icon/react';

import { IconSize } from '../../../utils/sizes';
import { modals } from '@mantine/modals';

const hasExportImport = false;

interface CohortManagerProps {
  index?: string; // optional for now: TODO remove or change to required
  size?: string;
}

const CohortManagerPanel = ({ size = 'md' }: CohortManagerProps) => {
  const coreDispatch = useCoreDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editingLabel, setEditingLabel] = useState('');
  const allCohorts: Array<Cohort> = useCoreSelector(selectAllCohorts);
  const currentCohort = useCoreSelector(selectCurrentCohort);

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

    coreDispatch(
      updateCohortName({ id: currentCohort.id, name: editingLabel }),
    );
    setIsEditing(false);
    setEditingLabel('');
  };

  const handleCreateNew = () => {
    coreDispatch(createNewCohort({ name: 'New Cohort' }));
  };

  const handleDuplicate = () => {
    coreDispatch(duplicateCohort());
  };

  const selectData = useMemo(() => {
    return allCohorts.map((cohort: Cohort) => ({
      label: cohort.name,
      value: cohort.id,
    }));
  }, [allCohorts]);

  useDeepCompareEffect(() => {
    if (!currentCohort) {
      coreDispatch(setCurrentCohortId(allCohorts[0].id));
    }
  }, [allCohorts, currentCohort, setCurrentCohortId]);

  const onSelectCohort = useCallback(
    (_value: unknown, option: ComboboxItem | null) => {
      if (option) {
        coreDispatch(setCurrentCohortId(option.value));
      }
    },
    [coreDispatch],
  );

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
      <Tooltip label="Duplicate current" position="bottom" withArrow>
        <Button
          size={`compact-${size}`}
          data-testid="duplicateButton"
          aria-label="Duplicate cohort"
          variant="action"
          color="secondary.4"
          onClick={handleDuplicate}
        >
          <CopyIcon size="1.5em" aria-hidden="true" />
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
                </Text>
              ),
              labels: { confirm: 'Delete Cohort', cancel: 'Cancel' },
              confirmProps: { color: theme.colors.accent[4] },
              onConfirm: () => {
                coreDispatch(
                  removeCohort({
                    id: currentCohort.id,
                    shouldShowMessage: true,
                  }),
                );
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

const CohortManager = ({ size = 'md' }: CohortManagerProps) => {
  // TODO: initialize and load cohorts from cohort storage
  //  as right now the redux-persist is handling cohorts
  return <CohortManagerPanel size={size} />;
};

export default CohortManager;
