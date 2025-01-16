import React from 'react';
import { Group } from '@mantine/core';
import JSONObjectDownloadButton from '../../components/Buttons/DownloadButtons/JSONObjectDownloadButton';
import {
  IndexedFilterSet,
  useCoreDispatch,
  setCohortIndexFilters,
  selectCohortFilters,
  useCoreSelector,
} from '@gen3/core';
import { useDeepCompareCallback } from 'use-deep-compare';
import UploadJSONButton from '../../components/Buttons/UploadJSONButton';

const CohortSelector = () => {
  const dispatch = useCoreDispatch();

  const cohortFilters = useCoreSelector(selectCohortFilters);

  const getData = () => cohortFilters;

  const setCohort = useDeepCompareCallback(
    (data: string) => {
      const jsonForm = JSON.parse(data);
      dispatch(
        setCohortIndexFilters({ filters: jsonForm as IndexedFilterSet }),
      );
    },
    [dispatch],
  );

  return (
    <Group>
      <JSONObjectDownloadButton
        getData={getData}
        filename="cohort.json"
        tooltip="Export Cohort"
      />
      <UploadJSONButton handleFileChange={setCohort} tooltip="Import Cohort" />
    </Group>
  );
};

export default CohortSelector;
