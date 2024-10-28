import React from 'react';
import { Group } from '@mantine/core';
import JSONObjectDownloadButton from '../../components/Buttons/DownloadButtons/JSONObjectDownloadButton';
import { FilterSet, useCoreDispatch, setCohortFilter } from '@gen3/core';
import { useDeepCompareCallback } from 'use-deep-compare';
import UploadJSONButton from '../../components/Buttons/UploadJSONButton';

interface CohortSelectorProps {
  showSelectedCohorts?: boolean;
  readonly index: string;
  readonly filters: FilterSet;
}

const CohortSelector: React.FC<CohortSelectorProps> = ({ index, filters }) => {
  const dispatch = useCoreDispatch();
  const getData = useDeepCompareCallback(() => {
    return filters;
  }, [filters]);

  const setCohort = useDeepCompareCallback(
    (data: string) => {
      const jsonForm = JSON.parse(data);
      dispatch(setCohortFilter({ index, filters: jsonForm as FilterSet }));
    },
    [index, dispatch],
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
