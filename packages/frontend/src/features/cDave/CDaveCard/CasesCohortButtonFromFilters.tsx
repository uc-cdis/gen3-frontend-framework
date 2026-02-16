import React from 'react';
import { Button } from '@mantine/core';
import { FilterSet } from '@gen3/core';

interface CasesCohortButtonFromFiltersProps {
  filters: FilterSet;
  numCases: number;
}

const CasesCohortButtonFromFilters = ({
  filters,
  numCases,
}: CasesCohortButtonFromFiltersProps) => {
  return <Button>Cohort {numCases.toLocaleString()}</Button>;
};

export default CasesCohortButtonFromFilters;
