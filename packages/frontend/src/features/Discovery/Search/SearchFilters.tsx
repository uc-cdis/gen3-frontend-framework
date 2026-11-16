import React from 'react';
import { Checkbox, Paper } from '@mantine/core';
import type { KeyValueSearchFilter } from '../types';
import type { SearchFilterState } from './types';

interface SearchFiltersProps {
  readonly values: string[];
  readonly filter: KeyValueSearchFilter;
  filterState: SearchFilterState;
  setFilterState: React.Dispatch<React.SetStateAction<SearchFilterState>>;
}

const SearchFilters = ({
  values,
  filter,
  filterState,
  setFilterState,
}: SearchFiltersProps) => {
  const { key } = filter;
  return (
    <div className="flex flex-col">
      <Paper className="flex flex-col gap-1 p-1">
        {values.map((value) => {
          const valueDisplayName =
            filter.valueDisplayNames && filter.valueDisplayNames[value]
              ? filter.valueDisplayNames[value]
              : value;
          return (
            <Checkbox
              key={`${key}-${value}`}
              checked={Boolean(filterState[key]?.[value])}
              label={valueDisplayName}
              onChange={(ev) => {
                const selectedValues = { ...filterState[key] };
                if (ev.target.checked) {
                  selectedValues[value] = true;
                } else {
                  delete selectedValues[value];
                }
                const newFilterState = {
                  ...filterState,
                  [key]: selectedValues,
                };
                if (Object.keys(selectedValues).length === 0) {
                  delete newFilterState[key];
                }
                setFilterState(newFilterState);
              }}
            />
          );
        })}
      </Paper>
    </div>
  );
};

export default SearchFilters;
