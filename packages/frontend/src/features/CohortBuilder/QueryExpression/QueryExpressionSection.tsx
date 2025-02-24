import React, { useContext, useState, useReducer, useRef } from 'react';
import { Button, Tooltip } from '@mantine/core';
import { useDeepCompareCallback, useDeepCompareEffect } from 'use-deep-compare';
import {
  MdKeyboardArrowDown as DownArrowIcon,
  MdKeyboardArrowUp as UpArrowIcon,
} from 'react-icons/md';
import { Icon } from '@iconify/react';
import tw from 'tailwind-styled-components';
import { omit } from 'lodash';
import { FilterSet } from '@gen3/core';
import OverflowTooltippedLabel from '../../../components/OverflowTooltippedLabel';
import { convertFilterToComponent } from './QueryRepresentation';
import {
  QueryExpressionsExpandedContext,
  CollapsedStateReducerAction,
} from './QueryExpressionsExpandedContext';

import { QueryExpressionContext } from './QueryExpressionContext';

import {
  getCombinedClassesExpandCollapseQuery,
  getCombinedClassesForRowCollapse,
} from '../style';
import CohortSelector from '../CohortSelector';

const QueryExpressionContainer = tw.div`
  flex
  items-center
  bg-base-min
  shadow-[0_-2px_6px_0_rgba(0,0,0,0.16)]
  border-secondary-darkest
  border-1
  border-l-4
  my-4
  mx-3
`;

const MAX_HEIGHT_QE_SECTION = 120;

const reducer = (
  state: Record<string, Record<string, boolean>>,
  action: CollapsedStateReducerAction,
) => {
  switch (action.type) {
    case 'init':
      return {
        ...state,
        [action.cohortId]: {},
      };
    case 'expand':
      if (action.field) {
        return {
          ...state,
          [action.cohortId]: {
            ...state[action.cohortId],
            [action.field]: true,
          },
        };
      } else
        return {
          ...state,
          [action.cohortId]: { ...state[action.cohortId] },
        };
    case 'collapse':
      if (action.field)
        return {
          ...state,
          [action.cohortId]: {
            ...state[action.cohortId],
            [action.field]: false,
          },
        };
      else
        return {
          ...state,
          [action.cohortId]: { ...state[action.cohortId] },
        };
    case 'expandAll':
      return {
        ...state,
        [action.cohortId]: Object.fromEntries(
          Object.keys(state[action.cohortId]).map((q) => [q, true]),
        ),
      };
    case 'collapseAll':
      return {
        ...state,
        [action.cohortId]: Object.fromEntries(
          Object.keys(state[action.cohortId]).map((q) => [q, false]),
        ),
      };
    case 'clear':
      if (!action.field) {
        return { ...state, [action.cohortId]: {} };
      } else {
        return {
          ...state,
          [action.cohortId]: omit(state[action.cohortId], action.field),
        };
      }
  }
};

interface QueryExpressionSectionProps {
  index: string;
  hideImportExport?: boolean;
  displayOnly?: boolean;
  showTitle?: boolean;
}

const QueryExpressionSection: React.FC<QueryExpressionSectionProps> = ({
  index,
  hideImportExport = true,
  displayOnly = false,
  showTitle = true,
}: Readonly<QueryExpressionSectionProps>) => {
  const [expandedState, setExpandedState] = useReducer(reducer, {});
  const [filtersSectionCollapsed, setFiltersSectionCollapsed] = useState(true);
  const filtersRef = useRef<HTMLDivElement>(null);
  const [QESectionHeight, setQESectionHeight] = useState(0);

  const {
    cohortName,
    cohortId,
    filters,
    useClearCohortFilters,
    useSetCohortFilters,
  } = useContext(QueryExpressionContext);
  const clearCohortFilters = useClearCohortFilters();
  const setCohortFilter = useSetCohortFilters();

  useDeepCompareEffect(() => {
    if (filtersRef.current) {
      const height = filtersRef.current.scrollHeight;
      setQESectionHeight(
        height > MAX_HEIGHT_QE_SECTION ? MAX_HEIGHT_QE_SECTION : height,
      );
    }
  }, [expandedState, filters, filtersRef]);

  const clearAllFilters = () => {
    clearCohortFilters(index);
    setExpandedState({
      type: 'clear',
      cohortId: cohortId,
      field: 'unset',
    });
  };
  const allQueryExpressionsCollapsed = Object.values(
    expandedState?.[cohortId] || {},
  ).every((q) => !q);

  const noFilters = Object.keys(filters?.root || {}).length === 0;

  // const dataFunctions = {
  //   useUpdateFacetFilters: partial(useUpdateFilters, index),
  //   useClearFilter: partial(useClearFilters, index),
  // };

  useDeepCompareEffect(() => {
    if (expandedState?.[cohortId] === undefined) {
      setExpandedState({
        type: 'init',
        cohortId: cohortId,
        field: 'unset',
      });
    }
  }, [cohortId, expandedState]);

  const getData = useDeepCompareCallback(() => {
    return filters;
  }, [filters]);

  const setCohort = useDeepCompareCallback(
    (data: string) => {
      const jsonForm = JSON.parse(data);
      setCohortFilter(index, jsonForm as FilterSet);
    },
    [index],
  );

  return (
    <QueryExpressionContainer>
      <QueryExpressionsExpandedContext.Provider
        value={[expandedState[cohortId], setExpandedState]}
      >
        <div className="flex flex-col w-full bg-primary-lighter">
          <div
            data-testid="text-cohort-filters-top-row"
            className="flex flex-row py-2 items-center border-secondary-darkest border-b-1"
          >
            <OverflowTooltippedLabel
              label={cohortName}
              className="font-bold text-secondary-contrast-darkest ml-3 max-w-[260px]"
            >
              {cohortName}
            </OverflowTooltippedLabel>
            <React.Fragment>
              {!displayOnly && (
                <button
                  data-testid="button-clear-all-cohort-filters"
                  className={`text-sm font-montserrat ml-2 px-1 hover:bg-primary-darkest hover:text-primary-content-lightest hover:rounded-md ${
                    noFilters
                      ? 'hidden'
                      : 'cursor-pointer text-secondary-contrast-darkest'
                  }`}
                  onClick={clearAllFilters}
                  disabled={noFilters}
                >
                  Clear All
                </button>
              )}
              <div className="display flex gap-2 ml-auto mr-3">
                <CohortSelector index={index} filters={filters} />
                <Tooltip
                  label={
                    noFilters
                      ? 'No values to expand/collapse'
                      : allQueryExpressionsCollapsed
                        ? 'Expand all values'
                        : 'Collapse all values'
                  }
                >
                  <Button
                    data-testid="button-expand-collapse-cohort-queries"
                    color="white"
                    onClick={() =>
                      allQueryExpressionsCollapsed
                        ? setExpandedState({
                            type: 'expandAll',
                            cohortId: cohortId,
                          })
                        : setExpandedState({
                            type: 'collapseAll',
                            cohortId: cohortId,
                          })
                    }
                    aria-label="Expand/collapse all queries"
                    aria-expanded={!allQueryExpressionsCollapsed}
                    className={getCombinedClassesExpandCollapseQuery(
                      allQueryExpressionsCollapsed,
                    )}
                    disabled={noFilters}
                  >
                    {allQueryExpressionsCollapsed ? (
                      <Icon
                        icon="gen3:chevron-expand"
                        aria-hidden="true"
                        height="1.5rem"
                      >
                        {' '}
                      </Icon>
                    ) : (
                      <Icon
                        icon="gen3:chevron-contract"
                        aria-hidden="true"
                        height="1.5rem"
                      >
                        {' '}
                      </Icon>
                    )}
                  </Button>
                </Tooltip>

                <Tooltip
                  label={
                    noFilters ||
                    (filtersRef.current != null &&
                      filtersRef?.current?.scrollHeight <=
                        MAX_HEIGHT_QE_SECTION)
                      ? 'All rows are already displayed'
                      : filtersSectionCollapsed
                        ? 'Display all rows'
                        : 'Display fewer rows'
                  }
                >
                  <Button
                    data-testid="button-expand-collapse-cohort-filters-section"
                    color="white"
                    onClick={() =>
                      setFiltersSectionCollapsed(!filtersSectionCollapsed)
                    }
                    aria-label="Expand/collapse filters section"
                    aria-expanded={!filtersSectionCollapsed}
                    disabled={
                      noFilters ||
                      (filtersRef.current != null &&
                        filtersRef?.current?.scrollHeight <=
                          MAX_HEIGHT_QE_SECTION)
                    }
                    className={getCombinedClassesForRowCollapse(
                      filtersSectionCollapsed,
                    )}
                  >
                    {filtersSectionCollapsed ? (
                      <React.Fragment>
                        <DownArrowIcon size={30} aria-hidden="true" />
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <UpArrowIcon size={30} aria-hidden="true" />
                      </React.Fragment>
                    )}
                  </Button>
                </Tooltip>
              </div>
            </React.Fragment>
          </div>
          <div
            data-testid="text-cohort-filters"
            className="flex flex-wrap bg-base-max w-full p-2 overflow-x-hidden"
            style={
              filtersSectionCollapsed
                ? { maxHeight: `${QESectionHeight}px`, overflowY: 'scroll' }
                : undefined
            }
            ref={filtersRef}
          >
            {noFilters ? (
              <p
                data-testid="text-no-active-cohort-filter"
                className="font-content"
              >
                No filters currently applied.
              </p>
            ) : (
              Object.keys(filters.root).map((k) => {
                return convertFilterToComponent(
                  filters.root[k],
                  index,
                  '.',
                  displayOnly,
                );
              })
            )}
          </div>
        </div>
      </QueryExpressionsExpandedContext.Provider>
    </QueryExpressionContainer>
  );
};

export default QueryExpressionSection;
