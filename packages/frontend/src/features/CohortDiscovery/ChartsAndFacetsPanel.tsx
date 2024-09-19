import React from 'react';
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

interface ChartsAndFacetsPanelProps {
  index: string;
  facets: Array<FacetDefinition>;
}

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
    fields: fields,
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

  const facetDataHooks: Record<SupportedFacetTypes, FacetDataHooks> =
    useDeepCompareMemo(() => {
      return {
        // TODO: see if there a better way to do this
        enum: {
          useGetFacetData: getEnumFacetData,
          useUpdateFacetFilters: partial(useUpdateFilters, index),
          useGetFacetFilters: partial(useGetFacetFilters, index),
          useClearFilter: partial(useClearFilters, index),
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

  return <div>{facets.map((facet) => {})}</div>;
};
