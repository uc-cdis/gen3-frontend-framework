import React, { useMemo, useState } from 'react';
import { LoadingOverlay } from '@mantine/core';
import { partial } from 'lodash';
import {
  CoreState,
  extractEnumFilterValue,
  type FacetDefinition,
  FacetType,
  isIntersection,
  selectIndexFilters,
  useCoreSelector,
  useGetAggsQuery,
  useGetCountsQuery,
  CombineMode,
} from '@gen3/core';
import { type CohortPanelConfig } from './types';
import { type SummaryChart } from '../../components/charts/types';
import { ErrorCard } from '../../components/MessageCards';
import { useMediaQuery } from '@mantine/hooks';

import {
  classifyFacets,
  extractRangeValues,
  getAllFieldsFromFilterConfigs,
  processBucketData,
  processRangeData,
  removeIntersectionFromEnum,
  useGetFacetFilters,
  useUpdateFilters,
} from '../../components/facets/utils';
import { useClearFilters } from '../../components/facets/hooks';
import {
  EnumFacetDataHooks,
  FacetDataHooks,
} from '../../components/facets/types';
import CohortManager from './CohortManager';
import { Charts } from '../../components/charts';
import ExplorerTable from './ExplorerTable/ExplorerTable';
import CountsValue from '../../components/counts/CountsValue';
import DownloadsPanel from './DownloadsPanel';
import {
  useDeepCompareCallback,
  useDeepCompareEffect,
  useDeepCompareMemo,
} from 'use-deep-compare';
import { toDisplayName } from '../../utils';
import {
  useCohortFilterCombineState,
  useFilterExpandedState,
  useSetCohortFilterCombineState,
  useToggleExpandFilter,
} from './hooks';
import DropdownPanel from './Panels/DropdownPanel';

const EmptyData = {};

/**
 * The main component that houses the charts, tabs, modals
 * filters, tables, buttons of the exploration page.
 *
 * All of these params come directly from the top level exploration page configuration file or
 * explorer config in legacy gitops.json file.
 * @example see packages/sampleCommons/config/gen3/explorer.json
 */
export const CohortPanel = ({
  guppyConfig,
  filters,
  charts = {},
  table,
  tabTitle,
  dropdowns,
  buttons,
  loginForDownload,
  sharedFiltersMap = undefined,
}: CohortPanelConfig): JSX.Element => {
  const isSm = useMediaQuery('(min-width: 639px)');
  const isMd = useMediaQuery('(min-width: 1373px)');
  const isXl = useMediaQuery('(min-width: 1600px)');

  let numCols = 3;
  if (isSm) numCols = 1;
  if (isMd) numCols = 2;
  if (isXl) numCols = 4;

  const index = guppyConfig.dataType;
  const fields = useMemo(
    () => getAllFieldsFromFilterConfigs(filters?.tabs ?? []),
    [filters?.tabs],
  );

  const [facetDefinitions, setFacetDefinitions] = useState<
    Record<string, FacetDefinition>
  >({});

  const [summaryCharts, setSummaryCharts] = useState<
    Record<string, SummaryChart>
  >({});

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
    fields: fields,
    filters: cohortFilters,
  });

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
          useTotalCounts: undefined,
        },
        exact: {
          useGetFacetData: getEnumFacetData,
          useUpdateFacetFilters: partial(useUpdateFilters, index),
          useGetFacetFilters: partial(useGetFacetFilters, index),
          useClearFilter: partial(useClearFilters, index),
          useFilterExpanded: partial(useFilterExpandedState, index),
          useToggleExpandFilter: partial(useToggleExpandFilter, index),
          useTotalCounts: undefined,
        },
        multiselect: {
          useGetFacetData: getEnumFacetData,
          useUpdateFacetFilters: partial(useUpdateFilters, index),
          useGetFacetFilters: partial(useGetFacetFilters, index),
          useClearFilter: partial(useClearFilters, index),
          useFilterExpanded: partial(useFilterExpandedState, index),
          useToggleExpandFilter: partial(useToggleExpandFilter, index),
          useTotalCounts: undefined,
        },
        range: {
          useGetFacetData: getRangeFacetData,
          useUpdateFacetFilters: partial(useUpdateFilters, index),
          useGetFacetFilters: partial(useGetFacetFilters, index),
          useClearFilter: partial(useClearFilters, index),
          useFilterExpanded: partial(useFilterExpandedState, index),
          useToggleExpandFilter: partial(useToggleExpandFilter, index),
          useTotalCounts: undefined,
        },
      };
    }, [getEnumFacetData, getRangeFacetData, index]);

  // Set the facet definitions based on the data only the first time the data is loaded
  useDeepCompareEffect(() => {
    if (isSuccess && Object.keys(facetDefinitions).length === 0) {
      const configFacetDefs = filters?.tabs.reduce(
        (acc: Record<string, FacetDefinition>, tab) => {
          return { ...tab.fieldsConfig, ...acc };
        },
        {},
      );

      const facetDefs = classifyFacets(
        data,
        index,
        guppyConfig?.fieldMapping ?? [],
        configFacetDefs ?? {},
        sharedFiltersMap,
      );
      setFacetDefinitions(facetDefs);

      // setup summary charts since nested fields can be listed by the split field name

      const summaryCharts = Object.keys(charts).reduce((acc, field) => {
        let chartField = field;
        if (facetDefs?.[field] === undefined) {
          const res = Object.values(facetDefs).filter((def) => {
            return def.dataField === field;
          });
          if (res.length > 0) {
            chartField = res[0].field;
          }
        }
        return {
          ...acc,
          [chartField]: charts[field],
        };
      }, {});

      setSummaryCharts(summaryCharts);
    }
  }, [
    isSuccess,
    data,
    facetDefinitions,
    index,
    guppyConfig.fieldMapping,
    charts,
  ]);

  const {
    data: counts,
    isSuccess: isCountSuccess,
    isError,
  } = useGetCountsQuery({
    type: index,
    filters: cohortFilters,
  });

  if (isError || isAggsQueryError) {
    return <ErrorCard message="Unable to fetch data from server" />; // TODO: replace with configurable message
  }

  return (
    <div className="flex flex-col mt-3 relative px-4 bg-base-light w-full">
      <LoadingOverlay visible={isAggsQueryFetching} />
      <CohortManager index={index} />

      {/* Flex container to ensure proper 25/75 split */}
      <div className="flex w-full">
        {/* Left panel - 25% */}
        <div id="cohort-builder-filters" className="flex-shrink-0 w-1/4 ">
          {filters?.tabs && (
            <DropdownPanel
              index={index}
              filters={filters}
              tabTitle={tabTitle}
              facetDefinitions={facetDefinitions}
              facetDataHooks={facetDataHooks}
            />
          )}
        </div>

        {/* Right content - 75% */}
        <div id="cohort-builder-content" className="flex flex-col w-3/4 pl-4">
          {/* Top row with DownloadsPanel and CountsValue */}
          <div className="flex justify-between mb-2 ml-2">
            <DownloadsPanel
              dropdowns={dropdowns ?? {}}
              buttons={buttons ?? []}
              loginForDownload={loginForDownload}
              index={index}
              totalCount={counts ?? 0}
              fields={table?.fields ?? []}
              filter={cohortFilters}
            />
            <CountsValue
              label={guppyConfig?.nodeCountTitle || toDisplayName(index)}
              counts={counts}
              isSuccess={isCountSuccess}
            />
          </div>

          {/* Charts Section */}
          <Charts
            charts={summaryCharts}
            data={data ?? EmptyData}
            counts={counts}
            isSuccess={isSuccess}
            numCols={numCols}
          />

          {/* Table Section */}
          {table?.enabled && (
            <div className="mt-2 flex flex-col">
              <div className="grid">
                <ExplorerTable index={index} tableConfig={table} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
