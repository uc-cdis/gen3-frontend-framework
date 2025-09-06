import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mantine/core';
import {
  Accessibility,
  CombineMode,
  CoreState,
  extractEnumFilterValue,
  FacetDefinition,
  FacetType,
  isIntersection,
  selectCurrentCohortId,
  selectIndexFilters,
  useCoreSelector,
  useGetAggsQuery,
  useGetCountsQuery,
  usePrevious,
} from '@gen3/core';
import FacetTabs from '../../components/facets/FacetTabs';
import {
  classifyFacets,
  extractRangeValues,
  FacetDataHooks,
  processBucketData,
  processRangeData,
  removeIntersectionFromEnum,
  useGetFacetFilters,
  useUpdateFilters,
} from '../../components/facets';
import { QueryOptions } from '../../components/facets/types';
import {
  useDeepCompareCallback,
  useDeepCompareEffect,
  useDeepCompareMemo,
} from 'use-deep-compare';
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

export interface CohortBuilderTabCategoryConfig {
  readonly label: string;
  readonly queryOptions: {
    readonly indexType: string;
  };
  readonly facets: ReadonlyArray<string>;
}

export type TabbedCohortBuilderFacetConfig = Record<
  string,
  CohortBuilderTabCategoryConfig
>;

const useCustomFacets = () => ({
  data: [],
  isSuccess: true,
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

export interface TabbedCohortBuilderConfiguration {
  tabsConfiguration: TabbedCohortBuilderFacetConfig;
  index: string;
  indexPrefix?: string;
}

const TabbedCohortBuilder = ({
  index,
  tabsConfiguration,
  indexPrefix = '',
}: TabbedCohortBuilderConfiguration) => {
  const tabsConfig = tabsConfiguration;
  const cohortBuilderFilters = [
    ...Object.values(tabsConfiguration).reduce(
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

  const cohortId = useCoreSelector((state: CoreState) =>
    selectCurrentCohortId(state),
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
    queryId: cohortId,
    indexPrefix: indexPrefix,
  });

  const {
    data: counts,
    isSuccess: isCountSuccess,
    isError,
  } = useGetCountsQuery({
    type: index,
    filters: cohortFilters,
    accessibility: accessLevel,
    queryId: cohortId,
    indexPrefix: indexPrefix,
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
  }, [activeTab, routerTab, prevRouterTab, router]);

  // Set the facet definitions based on the data only the first time the data is loaded
  useDeepCompareEffect(() => {
    if (isSuccess && Object.keys(facetDefinitions).length === 0) {
      const facetDefs = classifyFacets(data, index);
      setFacetDefinitions(facetDefs);

      // setup summary charts since nested fields can be listed by the split field nam
    }
  }, [isSuccess, data, facetDefinitions, index]);

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

  const EnumHookInstances = {
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
  };

  const RangeHookInstances = {
    useGetFacetData: getRangeFacetData,
    useUpdateFacetFilters: partial(useUpdateFilters, index),
    useGetFacetFilters: partial(useGetFacetFilters, index),
    useClearFilter: partial(useClearFilters, index),
    useFilterExpanded: partial(useFilterExpandedState, index),
    useToggleExpandFilter: partial(useToggleExpandFilter, index),
    useFieldNameToTitle: useFieldNameToTitle,
    useTotalCounts: undefined,
  };

  // Set up the hooks for the facet components to use based on the required index
  const facetDataHooks: Record<FacetType, FacetDataHooks> =
    useDeepCompareMemo(() => {
      return {
        // TODO: see if there a better way to do this
        enum: EnumHookInstances,
        exact: EnumHookInstances,
        multiselect: EnumHookInstances,
        range: RangeHookInstances,
        age: RangeHookInstances,
        year: RangeHookInstances,
        years: RangeHookInstances,
        days: RangeHookInstances,
        percent: RangeHookInstances,
        datetime: RangeHookInstances,
        toggle: RangeHookInstances,
        upload: EnumHookInstances,
      };
    }, [getEnumFacetData, getRangeFacetData, index]);

  return (
    <Stack gap="xs" align="stretch" classNames={{ root: 'w-full' }}>
      <FacetTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        facetDefinitions={facetDefinitions}
        tabsConfig={tabsConfig}
        usedFacets={cohortBuilderFilters}
        hooks={facetDataHooks}
        customFacetHooks={{
          useCustomFacets,
          useAvailableCustomFacets: (
            usedFacets: readonly string[],
            onlyFiltersWithValues: boolean,
            queryOptions?: QueryOptions,
          ) => ({ data: {}, isSuccess: true }),
          useAddCustomFilter: () => (filter: string) => {},
          useRemoveCustomFilter: () => (filter: string) => {},
        }}
        getFacetLabel={() => 'Cases'}
        cardScrollMargin={calculateStickyHeaderHeight()}
        useFieldNameToTitle={useFieldNameToTitle}
      />
    </Stack>
  );
};

export default TabbedCohortBuilder;
