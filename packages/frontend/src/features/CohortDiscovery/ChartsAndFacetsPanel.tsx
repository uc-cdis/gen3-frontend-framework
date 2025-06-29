import React from 'react';
import { Grid } from '@mantine/core';
import {
  extractEnumFilterValue,
  FacetDefinition,
  fieldNameToTitle,
} from '@gen3/core';
import { AppState, useAppSelector } from './appApi';
import { useDeepCompareCallback, useDeepCompareMemo } from 'use-deep-compare';
import {
  extractRangeValues,
  processBucketData,
  processRangeData,
} from '../../components/facets';
import { partial } from 'lodash';
import { SupportedFacetTypes } from './types';
import { createFacetPanel } from './FilterPanels/createFacetPanel';
import { EnumFacetPanelDataHooks } from './FilterPanels/EnumFacetPanel';
import { selectCurrentCohortIndexFilters } from './CohortManagment/CohortManagerSelectors';
import { useClearFilters, useGetFacetFilters, useUpdateFilters } from './hooks';
import { useFieldNameToTitle } from '../../components/facets/hooks';
import { useRoundedAggsQuery } from './queryApi';

interface ChartsAndFacetsPanelProps {
  index: string;
  facets: Array<FacetDefinition>;
}

const NUM_COLS = 2; // TODO: add to config

/**
 * CartsAndFacetsPanel component
 *
 * @param {string} index - The index type used for querying data.
 * @param {Array} facets - The list of facets to be rendered.
 * @returns {JSX.Element} The rendered component showing facets.
 */
const ChartsAndFacetsPanel: React.FC<ChartsAndFacetsPanelProps> = ({
  index,
  facets,
}) => {
  const cohortFilters = useAppSelector((state: AppState) =>
    selectCurrentCohortIndexFilters(state, index),
  );

  const {
    data,
    isSuccess,
    isLoading: isAggsQueryFetching,
    isError: isAggsQueryError,
  } = useRoundedAggsQuery({
    type: index,
    fields: facets.map((x) => x.field),
    filters: cohortFilters,
  });

  const getEnumFacetData = useDeepCompareCallback(
    (field: string) => {
      return {
        data: processBucketData(data?.[field]),
        enumFilters:
          field in cohortFilters.root
            ? extractEnumFilterValue(cohortFilters.root[field])
            : undefined,
        isSuccess: isSuccess,
        isFetching: isAggsQueryFetching,
        isError: isAggsQueryError,
      };
    },
    [cohortFilters, cohortFilters.root, data],
  );

  const getRangeFacetData = useDeepCompareCallback(
    (field: string) => {
      return {
        data: processRangeData(data?.[field]),
        filters: extractRangeValues(cohortFilters.root[field]),
        isSuccess: isSuccess,
      };
    },
    [data, cohortFilters.root],
  );

  const facetHooks: Record<SupportedFacetTypes, EnumFacetPanelDataHooks> =
    useDeepCompareMemo(() => {
      return {
        enum: {
          useGetFacetData: getEnumFacetData,
          useUpdateFacetFilters: partial(useUpdateFilters, index),
          useGetFacetFilters: partial(useGetFacetFilters, index),
          useClearFilter: partial(useClearFilters, index),
          useTotalCounts: undefined,
          useFieldNameToTitle: useFieldNameToTitle,
        }, // TODO: range facets
        // range: {
        //   useGetFacetData: getRangeFacetData,
        //   useUpdateFacetFilters: partial(useUpdateFilters, index),
        //   useGetFacetFilters: partial(useGetFacetFilters, index),
        //   useClearFilter: partial(useClearFilters, index),
        //   useTotalCounts: undefined,
        // },
      };
    }, [getEnumFacetData, getRangeFacetData, index]);

  const panels = useDeepCompareMemo(() => {
    return facets.map((facet) =>
      createFacetPanel(facet, 'bar', fieldNameToTitle(index), facetHooks.enum),
    );
  }, [facets, index, facetHooks.enum]);

  const colSpan = Math.floor(12 / NUM_COLS);
  const numLastRow = panels.length % NUM_COLS;

  const placeholderPanels = [];
  for (let i = 0; i < numLastRow; i++) {
    placeholderPanels.push(
      <div key={`placeholder-${i}`} className="invisible" />,
    );
  }

  return (
    <Grid className="w-full mx-2 bg-base-max p-4 transition-[height] ease-in-out duration-300">
      {panels.map((panel, index) => (
        <Grid.Col
          span={colSpan}
          key={`${index}-charts-${facets[index].field}-col`}
        >
          {panel}
        </Grid.Col>
      ))}
      {placeholderPanels.map((panel, index) => (
        <Grid.Col span={colSpan} key={`${index}-charts-placeholder-col`}>
          {panel}
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default ChartsAndFacetsPanel;
