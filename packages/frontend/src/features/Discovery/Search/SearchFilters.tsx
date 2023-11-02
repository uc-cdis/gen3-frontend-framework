import React from 'react';
import { Checkbox, Paper } from '@mantine/core';
import { KeyValueSearchFilter } from '../types';
import { SearchFilterState } from './types';

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
      <Paper>
        {values.map((value) => {
          const valueDisplayName =
            filter.valueDisplayNames && filter.valueDisplayNames[value]
              ? filter.valueDisplayNames[value]
              : value;
          return (
            <Checkbox
              key={`${key}-${value}`}
              checked={filterState[key] && filterState[key][value]}
              label={valueDisplayName}
              onChange={(ev) => {
                const newFilterState = { ...filterState };
                if (!newFilterState[key]) {
                  newFilterState[key] = {};
                }
                if (ev.target.checked) {
                  newFilterState[key][value] = true;
                } else {
                  delete newFilterState[key][value];
                  if (Object.keys(newFilterState[key]).length === 0) {
                    delete newFilterState[key];
                  }
                }
                setFilterState(newFilterState);
              }}
            ></Checkbox>
          );
        })}
      </Paper>
    </div>
  );
};

export default SearchFilters;
