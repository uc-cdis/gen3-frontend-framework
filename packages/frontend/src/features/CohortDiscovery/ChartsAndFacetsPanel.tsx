import React, { useMemo } from 'react';
import {
  CoreState,
  extractEnumFilterValue,
  FacetDefinition,
  FacetType,
  selectIndexFilters,
  useCoreSelector,
  useGetAggsQuery,
  useGetCountsQuery,
} from '@gen3/core';
import { useDeepCompareCallback, useDeepCompareMemo } from 'use-deep-compare';
import {
  extractRangeValues,
  FacetDataHooks,
  processBucketData,
  processRangeData,
  useGetFacetFilters,
  useUpdateFilters,
} from '../../components/facets';
import { partial } from 'lodash';
import { useClearFilters } from '../../components/facets/hooks';
import { SupportedFacetTypes } from './types';
import { createFacetPanel } from './FilterPanels/createFacetPanel';
import { EnumFacetPanelDataHooks } from './FilterPanels/EnumFacetPanel';
import { useGetFacetDataTotals } from './hooks';

interface ChartsAndFacetsPanelProps {
  index: string;
  facets: Array<FacetDefinition>;
}

/**
 * CartsAndFacetsPanel component
 *
 * @param {Object} props - The component properties.
 * @param {string} props.index - The index type used for querying data.
 * @param {Array} props.facets - The list of facets to be rendered.
 * @returns {JSX.Element} The rendered component showing facets.
 */
const CartsAndFacetsPanel: React.FC<ChartsAndFacetsPanelProps> = ({
  index,
  facets,
}) => {
  const cohortFilters = useCoreSelector((state: CoreState) =>
    selectIndexFilters(state, index),
  );

  const {
    data,
    isSuccess,
    isError: isAggsQueryError,
  } = useGetAggsQuery({
    type: index,
    fields: facets.map((x) => x.field),
    filters: cohortFilters,
  });

  const {
    data: counts,
    isSuccess: isCountSuccess,
    isError: isCountError,
  } = useGetCountsQuery({
    type: index,
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
      };
    },
    [cohortFilters, data, isSuccess],
  );

  const getRangeFacetData = useDeepCompareCallback(
    (field: string) => {
      return {
        data: processRangeData(data?.[field]),
        filters: extractRangeValues(cohortFilters.root[field]),
        isSuccess: isSuccess,
      };
    },
    [data, cohortFilters.root, isSuccess],
  );

  const facetHooks: Record<
    SupportedFacetTypes,
    EnumFacetPanelDataHooks | FacetDataHooks
  > = useDeepCompareMemo(() => {
    return {
      // TODO: see if there a better way to do this
      enum: {
        useGetFacetData: getEnumFacetData,
        useUpdateFacetFilters: partial(useUpdateFilters, index),
        useGetFacetFilters: partial(useGetFacetFilters, index),
        useClearFilter: partial(useClearFilters, index),
        useGetFacetDataCount: partial(useGetFacetDataTotals, index),
        useTotalCounts: undefined,
      },
      range: {
        useGetFacetData: getRangeFacetData,
        useUpdateFacetFilters: partial(useUpdateFilters, index),
        useGetFacetFilters: partial(useGetFacetFilters, index),
        useClearFilter: partial(useClearFilters, index),
        useTotalCounts: undefined,
      },
    };
  }, [getEnumFacetData, getRangeFacetData, index]);

  const panels = useMemo(
    () =>
      facets.map((facet) =>
        createFacetPanel(facet, 'bar', index, facetHooks.enum),
      ),
    [facets],
  );

  return <div>{panels}</div>;
};
