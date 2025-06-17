import React, { useCallback, useMemo } from 'react';
import {
  Button,
  ComboboxItem,
  Group,
  Select,
  Loader,
  LoadingOverlay,
} from '@mantine/core';
import { Operation } from '@gen3/core';
import {
  setCurrentCohortId,
  createNewCohort,
  saveCohortToStorage,
  deleteCohortFromStorage,
  removeCohort,
  updateCohortName,
  updateCohortFilter,
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

interface CohortManagerProps {
  index: string;
}

export const CohortManager = ({ index }: CohortManagerProps) => {
  const dispatch = useAppDispatch();

  const allCohorts = useAppSelector(selectAllCohorts);
  const currentCohort = useAppSelector(selectCurrentCohort);
  const savedCohorts = useAppSelector(selectSavedCohorts);
  const unsavedCohorts = useAppSelector(selectUnsavedCohorts);
  const modifiedUnsavedCohorts = useAppSelector(selectModifiedUnsavedCohorts);
  const loading = useAppSelector(selectCohortManagerLoading);
  const error = useAppSelector(selectCohortManagerError);
  const autoSaveInProgress = useAppSelector(selectAutoSaveInProgress);

  const currentCohortAutoSaving = useAppSelector((state: AppState) =>
    selectCohortAutoSaveStatus(state, currentCohort.id),
  );

  const handleCreateNew = () => {
    dispatch(createNewCohort({ name: 'New Cohort' }));
  };

  const handleSaveCohort = (cohortId: string) => {
    dispatch(saveCohortToStorage({ cohortId }));
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

  const handleRenameCohort = (id: string, name: string) => {
    dispatch(updateCohortName({ id, name }));
  };

  const handleSelectCohort = (cohortId: string) => {
    dispatch(setCurrentCohortId(cohortId));
  };

  const handleUpdateFilter = (
    index: string,
    field: string,
    filter: Operation,
  ) => {
    dispatch(
      updateCohortFilter({
        index,
        field,
        filter,
      }),
    );
  };

  const onSelectCohort = useCallback(
    (_value: unknown, option: ComboboxItem | null) => {
      console.log('onSelectCohort', option);
      if (option) {
        dispatch(setCurrentCohortId(option.value));
      }
    },
    [dispatch],
  );

  if (loading) {
    return <div>Loading cohorts...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  return (
    <Group gap="xs" className="flex pt-4 pl-2">
      <Select
        data={selectData}
        value={currentCohort?.id ?? null}
        onChange={onSelectCohort}
      />
      <Button
        size="sm"
        variant="outline"
        color="secondary.4"
        onClick={handleCreateNew}
      >
        Add New
      </Button>
    </Group>
  );
};

export default CohortManager;
