import React, { useState } from 'react';
import { Button } from '@mantine/core';
import { FilterSet, useLazyGetObjectIdsQuery } from '@gen3/core';
import { WithOrWithoutCohortType } from './types';

interface CasesCohortButtonFromFiltersProps {
  filters: FilterSet;
  numCases: number;
}

const CreateCohortFromFiltersButton = ({
  filters,
  numCases,
}: CasesCohortButtonFromFiltersProps) => {
  const [withOrWithoutCohort, setWithOrWithoutCohort] =
    useState<WithOrWithoutCohortType>(undefined);
  const [fetchIds, { isFetching }] = useLazyGetObjectIdsQuery();

  return <Button>Cohort {numCases.toLocaleString()}</Button>;
};

export default CreateCohortFromFiltersButton;
