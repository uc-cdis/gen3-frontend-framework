import React, { useState } from 'react';
import { JSONObject, JSONValue } from '@gen3/core';
import { AdvancedSearchFilters, SearchKV } from '../types';
import { Accordion, Button, SegmentedControl } from '@mantine/core';
import { MdUndo as UndoIcon } from 'react-icons/md';
import SearchFilters from './SearchFilters';
import { SearchFilterState } from './types';

const getFilterValuesByKey = (
  key: string,
  studies: JSONObject[],
  filtersField?: string,
  uidField?: string,
) => {
  if (!studies) {
    return [];
  }

  if (!filtersField) {
    throw new Error(
      'Misconfiguration error: missing required configuration property `discoveryConfig.features.advSearchFilters.field`',
    );
  }

  if (!uidField) {
    throw new Error(
      'Misconfiguration error: missing required configuration property `discoveryConfig.features.advSearchFilters.field`',
    );
  }

  const filterValuesMap: Record<string, JSONValue> = {};
  studies.forEach((study) => {
    const studyFilters: SearchKV[] =
      (study[filtersField] as unknown as SearchKV[]) ?? [];

    if (!studyFilters) {
      // eslint-disable-next-line no-console
      console.warn(
        `Warning: expected to find property '${filtersField}' in study metadata for study ${
          study[uidField] ?? 'unknown'
        }, but could not find it! This study will not be filterable by the advanced search filters.`,
      );
      return;
    }
    try {
      studyFilters.forEach((filterValue: SearchKV) => {
        if (filterValue.key === key) {
          filterValuesMap[filterValue.value] = true;
        }
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      // eslint-disable-next-line no-console
      console.error(
        `The above error appeared in study ${study[uidField] ?? 'unknown'}`,
      );
    }
  });
  return Object.keys(filterValuesMap);
};

enum SearchCombination {
  and = 'AND',
  or = 'OR',
}

export interface AdvancedSearchProps {
  advSearchFilters: AdvancedSearchFilters;
  studies: JSONObject[];
  uidField?: string;
  opened: boolean;
}

const AdvancedSearch = ({
  advSearchFilters,
  studies,
  uidField,
}: AdvancedSearchProps) => {
  const [searchCombination, setSearchCombination] = useState<SearchCombination>(
    SearchCombination.and,
  );
  const [filterState, setFilterState] = useState<SearchFilterState>({});

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
          {advSearchFilters.filters.map((filter) => {
            const { key, keyDisplayName } = filter;
            const values = getFilterValuesByKey(
              key,
              studies,
              advSearchFilters.field,
              uidField,
            );
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
