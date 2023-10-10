import React, { useEffect, useState } from 'react';
import {  KeyValueSearchFilter } from '../types';
import { Accordion, Button, SegmentedControl } from '@mantine/core';
import { MdUndo as UndoIcon } from 'react-icons/md';
import SearchFilters from './SearchFilters';
import { SearchCombination, SearchFilterState, SetAdvancedSearchFiltersFn } from './types';



export interface AdvancedSearchProps {
  advSearchFilters: ReadonlyArray<KeyValueSearchFilter>
  setAdvancedSearchFilters: SetAdvancedSearchFiltersFn;
  opened: boolean;
}

const AdvancedSearch = ({
  advSearchFilters,
  setAdvancedSearchFilters,
}: AdvancedSearchProps) => {
  const [searchCombination, setSearchCombination] = useState<SearchCombination>(
    SearchCombination.and,
  );
  const [filterState, setFilterState] = useState<SearchFilterState>({});

  useEffect(() => {
    setAdvancedSearchFilters({
      operation: searchCombination,
      filters: filterState,
    });
  }, [searchCombination, filterState, setAdvancedSearchFilters]);

  return (
    <React.Fragment>
      <div className="flex flex-col">
        <div className="flex flex-row justify-between items-center">
          <SegmentedControl
            data={[
              { label: 'AND', value: SearchCombination.and },
              { label: 'OR', value: SearchCombination.or },
            ]}
            value={searchCombination}
            size="sm"
            color="accent"
            onChange={(value: string) =>
              setSearchCombination(value as SearchCombination)
            }
          />
          <Button
            size="sm"
            disabled={Object.keys(filterState).length === 0}
            onClick={() => {
              setFilterState({});
              setSearchCombination(SearchCombination.and);
            }}
            leftIcon={<UndoIcon />}
            className="ml-2"
          >
            Reset Filters
          </Button>
        </div>

        <Accordion className="mt-2" radius="sm" multiple>
          {advSearchFilters.map((filter) => {
            const { key, keyDisplayName, valueDisplayNames } = filter;
            const values = valueDisplayNames ? Object.values(valueDisplayNames) : [];
            return (
              <Accordion.Item
                value={key}
                key={`discovery-advancedSearch-accordion-${key}`}
              >
                <Accordion.Control key={key}>
                  {' '}
                  {keyDisplayName || key}
                </Accordion.Control>
                <Accordion.Panel>
                  <SearchFilters
                    values={values}
                    filter={filter}
                    filterState={filterState}
                    setFilterState={setFilterState}
                  />
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </div>
    </React.Fragment>
  );
};

export default AdvancedSearch;
