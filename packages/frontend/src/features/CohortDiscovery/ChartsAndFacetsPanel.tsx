import React, { useMemo } from 'react';
import { Grid } from '@mantine/core';
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
import { computeRowSpan } from '../../components/charts';

interface ChartsAndFacetsPanelProps {
  index: string;
  facets: Array<FacetDefinition>;
}

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
    [cohortFilters, cohortFilters.root, data, isSuccess],
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

  const facetHooks: Record<SupportedFacetTypes, EnumFacetPanelDataHooks> =
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
        // range: {
        //   useGetFacetData: getRangeFacetData,
        //   useUpdateFacetFilters: partial(useUpdateFilters, index),
        //   useGetFacetFilters: partial(useGetFacetFilters, index),
        //   useClearFilter: partial(useClearFilters, index),
        //   useTotalCounts: undefined,
        // },
      };
    }, [getEnumFacetData, getRangeFacetData, index]);

  const panels = useDeepCompareMemo(
    () =>
      facets.map((facet) =>
        createFacetPanel(facet, 'bar', index, facetHooks.enum),
      ),
    [facets, index, facetHooks.enum],
  );

  const spans = computeRowSpan(panels.length);

  return (
    <Grid className="w-full mx-2">
      {panels.map((panel, index) => (
        <Grid.Col
          span={spans[index]}
          key={`${index}-charts-${facets[index].field}-col`}
        >
          {panel}
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default ChartsAndFacetsPanel;
