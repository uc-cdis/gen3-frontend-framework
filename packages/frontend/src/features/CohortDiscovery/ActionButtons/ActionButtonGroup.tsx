import React, { useCallback, useMemo } from 'react';
import { Button, ComboboxItem, Group, Select } from '@mantine/core';
import { ActionButtonProps, Cohort } from '../types';
import SaveActionButton from './SaveActionButton';
import { useAppSelector, useAppDispatch } from '../appApi';
import {
  selectCurrentCohort,
  selectAllSavedCohorts,
  setCurrentCohortId,
} from '../SavedCohortManagerSlice';
import { setAllIndexFilters } from '../SavedCohortManagerSlice';
import { useDeepCompareEffect } from 'use-deep-compare';

const ActionButtonGroup: React.FC<ActionButtonProps> = ({ index }) => {
  const data: Cohort[] = useAppSelector(selectAllSavedCohorts); // all saved cohorts
  const currentCohort = useAppSelector(selectCurrentCohort);
  const dispatch = useAppDispatch();

  const selectData = useMemo(() => {
    return data.map((cohort) => ({ label: cohort.name, value: cohort.id }));
  }, [data]);

  const onSelectCohort = useCallback(
    (_value: unknown, option: ComboboxItem | null) => {
      console.log('onSelectCohort', option);
      if (option) {
        dispatch(setCurrentCohortId(option.value));
      }
    },
    [dispatch],
  );

  console.log('currentCohortId', currentCohort);

  return (
    <Group gap="xs" className="flex pt-4 pl-2">
      <Select
        data={selectData}
        value={currentCohort?.id ?? null}
        onChange={onSelectCohort}
      />
      <SaveActionButton index={index} />
      <Button
        size="sm"
        variant="outline"
        color="secondary.4"
        classNames={{
          root: 'bg-base-max',
        }}
      >
        Export Cohort
      </Button>
      <Button
        size="sm"
        variant="outline"
        color="secondary.4"
        classNames={{
          root: 'bg-base-max',
        }}
      >
        Import Cohort
      </Button>
    </Group>
  );
};

export default ActionButtonGroup;
