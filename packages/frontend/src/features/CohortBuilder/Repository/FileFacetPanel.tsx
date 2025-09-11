import React, { useMemo, useState } from 'react';
import {
  useDeepCompareCallback,
  useDeepCompareEffect,
  useDeepCompareMemo,
} from 'use-deep-compare';
import {
  Accessibility,
  CombineMode,
  CoreState,
  extractEnumFilterValue,
  FacetDefinition,
  isIntersection,
  selectIndexFilters,
  useCoreSelector,
} from '@gen3/core';

import DropdownPanel from '../../../components/facets/Panels/DropdownPanel';
import {
  classifyFacets,
  EnumFacetDataHooks,
  FacetDataHooks,
  FieldToName,
  getAllFieldsFromFilterConfigs,
  processBucketData,
  removeIntersectionFromEnum,
  useClearFilters,
  useFieldNameToTitle,
  useGetFacetFilters,
  useUpdateFilters,
} from '../../../components/facets';
import { partial } from 'lodash';
import {
  useCohortFilterCombineState,
  useFilterExpandedState,
  useSetCohortFilterCombineState,
  useToggleExpandFilter,
} from '../hooks';
import { useGetFacetValuesQuery } from './hooks';
import { TabsConfig } from '../types';
import { ErrorCard } from '../../../components/MessageCards';

interface FileFacetPanelProps {
  filters: TabsConfig;
  index: string;
  fieldMapping?: ReadonlyArray<FieldToName>;
  tabTitle: string;
  indexPrefix?: string;
}

export const FileFacetPanel = ({
  filters,
  index,
  tabTitle,
  fieldMapping,
  indexPrefix = '',
}: FileFacetPanelProps): JSX.Element => {
  const repositoryFilters = useCoreSelector((state: CoreState) =>
    selectIndexFilters(state, index),
  );

  const fields = useMemo(
    () => getAllFieldsFromFilterConfigs(filters?.tabs ?? []),
    [filters?.tabs],
  );

  const [accessLevel, setAccessLevel] = useState<Accessibility>(
    Accessibility.ALL,
  );

  const [facetDefinitions, setFacetDefinitions] = useState<
    Record<string, FacetDefinition>
  >({});

  const {
    data: facetData,
    isSuccess: isFacetsQuerySuccess,
    isFetching: isFacetsQueryFetching,
    isError: isFacetsQueryError,
  } = useGetFacetValuesQuery({
    type: index,
    fields: fields,
    filters: repositoryFilters,
    indexPrefix: indexPrefix,
  });

  // Set the facet definitions based on the data only the first time the data is loaded
  useDeepCompareEffect(() => {
    if (isFacetsQuerySuccess && Object.keys(facetDefinitions).length === 0) {
      const configFacetDefs = filters?.tabs.reduce(
        (acc: Record<string, FacetDefinition>, tab) => {
          return { ...tab.fieldsConfig, ...acc };
        },
        {},
      );

      const facetDefs = classifyFacets(
        facetData,
        index,
        fieldMapping ?? [],
        configFacetDefs ?? {},
      );
      setFacetDefinitions(facetDefs);
    }
  }, [isFacetsQuerySuccess, facetData, facetDefinitions, index, fieldMapping]);

  const getEnumFacetData = useDeepCompareCallback(
    (field: string) => {
      let filters = undefined;
      let combineMode: CombineMode = 'or';
      if (field in repositoryFilters.root) {
        if (isIntersection(repositoryFilters.root[field])) {
          const intersectionFilters = removeIntersectionFromEnum(
            repositoryFilters.root[field],
          );
          if (intersectionFilters) {
            filters = extractEnumFilterValue(intersectionFilters);
            combineMode = 'and';
          }
        } else {
          filters = extractEnumFilterValue(repositoryFilters.root[field]);
        }
      }

      return {
        data: processBucketData(facetData?.[field]),
        enumFilters: filters,
        combineMode: combineMode,
        isSuccess: isFacetsQuerySuccess,
        isFetching: isFacetsQueryFetching,
      };
    },
    [repositoryFilters.root, facetData, isFacetsQuerySuccess],
  );

  const facetDataHooks: Record<'enum', FacetDataHooks | EnumFacetDataHooks> =
    useDeepCompareMemo(() => {
      return {
        enum: {
          useGetFacetData: getEnumFacetData,
          useUpdateFacetFilters: partial(useUpdateFilters, index),
          useGetFacetFilters: partial(useGetFacetFilters, index),
          useClearFilter: partial(useClearFilters, index),
          useFilterExpanded: partial(useFilterExpandedState, index),
          useToggleExpandFilter: partial(useToggleExpandFilter, index),
          useGetCombineMode: partial(useCohortFilterCombineState, index),
          useSetCombineMode: partial(useSetCohortFilterCombineState, index),
          useFieldNameToTitle: useFieldNameToTitle,
          useTotalCounts: undefined,
          useUpdateCombineMode: () => null,
        },
      };
    }, [getEnumFacetData, index]);

  if (isFacetsQueryError) {
    return <ErrorCard message="Unable to fetch data from server" />; // TODO: replace with configurable message
  }

  return (
    <DropdownPanel<'enum'>
      index={index}
      filters={filters}
      facetDefinitions={facetDefinitions}
      facetDataHooks={facetDataHooks}
      showAccessLevel={false}
      tabTitle={tabTitle}
      onAccessChange={setAccessLevel}
      accessLevel={accessLevel}
    />
  );
};

export default FileFacetPanel;
