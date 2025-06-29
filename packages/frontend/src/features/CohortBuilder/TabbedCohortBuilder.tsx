import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import CohortBuilderDefaultConfig from './data/cohort_builder.json';
import {
  Accessibility,
  CombineMode,
  CoreState,
  extractEnumFilterValue,
  type FacetDefinition,
  FacetType,
  isIntersection,
  selectIndexFilters,
  useCoreSelector,
  useGetAggsQuery,
  usePrevious,
} from '@gen3/core';
import FacetTabs from '../../components/facets/FacetTabs';
import {
  EnumFacetDataHooks,
  extractRangeValues,
  FacetDataHooks,
  processBucketData,
  processRangeData,
  removeIntersectionFromEnum,
  useGetFacetFilters,
  useUpdateFilters,
} from '../../components/facets';
import { QueryOptions } from '../../components/facets/types';
import { useDeepCompareCallback, useDeepCompareMemo } from 'use-deep-compare';
import { partial } from 'lodash';
import {
  useClearFilters,
  useFieldNameToTitle,
} from '../../components/facets/hooks';
import {
  useCohortFilterCombineState,
  useFilterExpandedState,
  useSetCohortFilterCombineState,
  useToggleExpandFilter,
} from './hooks';

export interface CohortBuilderCategoryConfig {
  readonly label: string;
  readonly queryOptions: {
    readonly indexType: string;
  };
  readonly facets: ReadonlyArray<string>;
}

type CohortBuilderCategory =
  | 'general'
  | 'demographic'
  | 'general_diagnosis'
  | 'disease_status'
  | 'disease_specific_classifications'
  | 'treatment'
  | 'exposure'
  | 'other_clinical_attributes'
  | 'biospecimen'
  | 'available_data'
  | 'custom';

export type TabbedCohortBuilderFacetConfig = Record<
  CohortBuilderCategory,
  CohortBuilderCategoryConfig
>;

const useCustomFacets = () => ({
  data: [],
});

const useAddCustomFilter = (x: string) => {};

export const calculateStickyHeaderHeight = (): number => {
  const globalHeader = document.querySelector('#global-header');
  const contextBar = document.querySelector('#context-bar');
  return (
    (globalHeader?.getBoundingClientRect()?.height || 0) +
    (contextBar?.getBoundingClientRect()?.height || 0)
  );
};

export interface TabbedCohortBuilderProps {
  tabsConfig: TabbedCohortBuilderFacetConfig;
  index: string;
}

const TabbedCohortBuilder = ({
  tabsConfig,
  index,
}: TabbedCohortBuilderProps) => {
  const cohortBuilderFilters = [
    ...Object.values(CohortBuilderDefaultConfig.config).reduce(
      (filters: string[], category) => {
        return [...filters, ...category.facets];
      },
      [] as string[],
    ),
  ];

  const router = useRouter();
  const routerTab = router?.query?.tab;
  const prevRouterTab = usePrevious(routerTab);
  const [activeTab, setActiveTab] = useState<string | null>(
    routerTab ? (routerTab as string) : Object.keys(tabsConfig)[0],
  );
  const [accessLevel, setAccessLevel] = useState<Accessibility>(
    Accessibility.ALL,
  );

  const cohortFilters = useCoreSelector((state: CoreState) =>
    selectIndexFilters(state, index),
  );

  const {
    data,
    isSuccess,
    isFetching: isAggsQueryFetching,
    isError: isAggsQueryError,
  } = useGetAggsQuery({
    type: index,
    fields: cohortBuilderFilters,
    filters: cohortFilters,
    accessibility: accessLevel,
  });

  const [facetDefinitions, setFacetDefinitions] = useState<
    Record<string, FacetDefinition>
  >({});

  useEffect(() => {
    // Check if the router initiated the change
    if (routerTab !== prevRouterTab) {
      setActiveTab(routerTab as string);
    } else {
      // Change initiated by user interaction
      if (activeTab !== routerTab) {
        router.push({ query: { ...router.query, tab: activeTab } }, undefined, {
          scroll: false,
        });
      }
    }
    // https://github.com/vercel/next.js/discussions/29403#discussioncomment-1908563
  }, [activeTab, routerTab, prevRouterTab]);

  const getEnumFacetData = useDeepCompareCallback(
    (field: string) => {
      let filters = undefined;
      let combineMode: CombineMode = 'or';
      if (field in cohortFilters.root) {
        if (isIntersection(cohortFilters.root[field])) {
          const intersectionFilters = removeIntersectionFromEnum(
            cohortFilters.root[field],
          );
          if (intersectionFilters) {
            filters = extractEnumFilterValue(intersectionFilters);
            combineMode = 'and';
          }
        } else {
          filters = extractEnumFilterValue(cohortFilters.root[field]);
        }
      }

      return {
        data: processBucketData(data?.[field]),
        enumFilters: filters,
        combineMode: combineMode,
        isSuccess: isSuccess,
        isFetching: isAggsQueryFetching,
        isError: isAggsQueryError,
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
        isFetching: isAggsQueryFetching,
        isError: isAggsQueryError,
      };
    },
    [data, cohortFilters.root, isSuccess],
  );

  // Set up the hooks for the facet components to use based on the required index
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const facetDataHooks: Record<FacetType, FacetDataHooks | EnumFacetDataHooks> =
    useDeepCompareMemo(() => {
      return {
        // TODO: see if there a better way to do this
        enum: {
          useGetFacetData: getEnumFacetData,
          useUpdateFacetFilters: partial(useUpdateFilters, index),
          useGetFacetFilters: partial(useGetFacetFilters, index),
          useClearFilter: partial(useClearFilters, index),
          useFilterExpanded: partial(useFilterExpandedState, index),
          useToggleExpandFilter: partial(useToggleExpandFilter, index),
          useGetCombineMode: partial(useCohortFilterCombineState, index),
          useSetCombineMode: partial(useSetCohortFilterCombineState, index),
          useSetFilterExpanded: useFieldNameToTitle,
          useTotalCounts: undefined,
        },
        exact: {
          useGetFacetData: getEnumFacetData,
          useUpdateFacetFilters: partial(useUpdateFilters, index),
          useGetFacetFilters: partial(useGetFacetFilters, index),
          useClearFilter: partial(useClearFilters, index),
          useFilterExpanded: partial(useFilterExpandedState, index),
          useToggleExpandFilter: partial(useToggleExpandFilter, index),
          useSetFilterExpanded: useFieldNameToTitle,
          useTotalCounts: undefined,
        },
        multiselect: {
          useGetFacetData: getEnumFacetData,
          useUpdateFacetFilters: partial(useUpdateFilters, index),
          useGetFacetFilters: partial(useGetFacetFilters, index),
          useClearFilter: partial(useClearFilters, index),
          useFilterExpanded: partial(useFilterExpandedState, index),
          useToggleExpandFilter: partial(useToggleExpandFilter, index),
          useSetFilterExpanded: useFieldNameToTitle,
          useTotalCounts: undefined,
        },
        range: {
          useGetFacetData: getRangeFacetData,
          useUpdateFacetFilters: partial(useUpdateFilters, index),
          useGetFacetFilters: partial(useGetFacetFilters, index),
          useClearFilter: partial(useClearFilters, index),
          useFilterExpanded: partial(useFilterExpandedState, index),
          useToggleExpandFilter: partial(useToggleExpandFilter, index),
          useSetFilterExpanded: useFieldNameToTitle,
          useTotalCounts: undefined,
        },
      };
    }, [getEnumFacetData, getRangeFacetData, index]);

  return (
    <FacetTabs
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      facetDefinitions={facetDefinitions}
      tabsConfig={tabsConfig}
      usedFacets={cohortBuilderFilters}
      hooks={{
        useGetFacetData: getEnumFacetData,
        useGetRangeFacetData: getRangeFacetData,
        useUpdateFacetFilters: partial(useUpdateFilters, index),
        useFieldNameToTitle: useFieldNameToTitle,
        useGetFacetFilters: partial(useGetFacetFilters, index),
        useClearFilter: partial(useClearFilters, index),
        useFilterExpanded: partial(useFilterExpandedState, index),
        useToggleExpandFilter: partial(useToggleExpandFilter, index),
        useGetCombineMode: partial(useCohortFilterCombineState, index),
        useSetCombineMode: partial(useSetCohortFilterCombineState, index),
        useSetFilterExpanded: useFieldNameToTitle,
        useTotalCounts: undefined,
      }}
      customFacetHooks={{
        useCustomFacets,
        useAvailableCustomFacets: (
          usedFacets: readonly string[],
          onlyFiltersWithValues: boolean,
          queryOptions?: QueryOptions,
        ) => ({ data: {} }),
        useAddCustomFilter: () => (filter: string) => {},
        useRemoveCustomFilter: () => (filter: string) => {},
      }}
      getFacetLabel={() => 'cases'}
      cardScrollMargin={calculateStickyHeaderHeight()}
    />
  );
};

export default TabbedCohortBuilder;
