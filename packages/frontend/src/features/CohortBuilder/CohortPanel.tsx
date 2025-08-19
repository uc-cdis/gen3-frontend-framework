import React, { useMemo, useState } from 'react';
import { partial } from 'lodash';
import {
  Accessibility,
  AggregationsData,
  CombineMode,
  CoreState,
  extractEnumFilterValue,
  FacetDefinition,
  FacetType,
  isIntersection,
  selectCurrentCohortId,
  selectIndexFilters,
  selectSharedFilters,
  useCoreSelector,
  useGetAggsQuery,
  useGetCountsQuery,
} from '@gen3/core';
import { type CohortPanelConfiguration } from './types';
import {
  Charts,
  CollapsableCharts,
  type SummaryChart,
} from '../../components/charts';
import { ErrorCard } from '../../components/MessageCards';
import { useMediaQuery } from '@mantine/hooks';
import {
  classifyFacets,
  EnumFacetDataHooks,
  extractRangeValues,
  FacetDataHooks,
  getAllFieldsFromFilterConfigs,
  processBucketData,
  processRangeData,
  removeIntersectionFromEnum,
  useGetFacetFilters,
  useUpdateFilters,
} from '../../components/facets';
import {
  useClearFilters,
  useFieldNameToTitle,
} from '../../components/facets/hooks';
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
import DropdownPanel from '../../components/facets/Panels/DropdownPanel';
import QueryExpression from './QueryExpression';

const EmptyData = {};

/**
 * The main component that houses the charts, tabs, modal
 * filters, tables, buttons of the exploration page.
 *
 * All of these params come directly from the top level exploration page configuration file or
 * explorer config in a legacy gitops.json file.
 * @example see packages/sampleCommons/config/gen3/explorer.json
 */

interface CohortPanelConfigurationWithAccessLevel
  extends CohortPanelConfiguration {
  showAccessLevel?: boolean;
}

/**
 * CohortPanel is a React component that provides an interactive interface for cohort exploration and filtering.
 * It integrates with data services and facilitates visualization, filtering, and analysis tasks.
 *
 * @param {Object} props                          The properties required to configure the CohortPanel component.
 * @param {Object} props.guppyConfig              Configuration object for Guppy, including field mappings and data type information.
 * @param {Object} props.filters                  Configuration for filter tabs, including filter fields and layout.
 * @param {Object} [props.charts={}]              Optional set of chart configuration objects for rendering summaries.
 * @param {Object} [props.chartsSection]          Optional configuration for an additional section of charts.
 * @param {Object} props.table                    Reference to the table configuration or component for displaying data.
 * @param {string} props.tabTitle                 Title for the filter tab section.
 * @param {Object[]|undefined} props.dropdowns    Dropdown menu configuration, allowing for additional filter options or actions.
 * @param {Object[]|undefined} props.buttons      List of button configurations for actions such as downloads.
 * @param {boolean} props.loginForDownload        Determines whether login is required to enable download functionality.
 * @param {boolean} [props.showAccessLevel=false] Indicates if the user access level should be displayed on the panel.
 *
 * @returns {JSX.Element}                         Returns a JSX element rendering the CohortPanel. This includes filter options,
 *                                                summary charts, cohort manager, and data display components.
 */
export const CohortPanel = ({
  guppyConfig,
  filters,
  charts = {},
  chartsSection = undefined,
  table,
  tabTitle,
  dropdowns,
  buttons,
  loginForDownload,
  showAccessLevel = false,
}: CohortPanelConfigurationWithAccessLevel): JSX.Element => {
  const isSm = useMediaQuery('(min-width: 639px)');
  const isMd = useMediaQuery('(min-width: 1373px)');
  const isXl = useMediaQuery('(min-width: 1600px)');
  const [accessLevel, setAccessLevel] = useState<Accessibility>(
    Accessibility.ALL,
  );
  const sharedFiltersMap = useCoreSelector((state: CoreState) =>
    selectSharedFilters(state),
  );

  const defaultDropdowns = useMemo(() => dropdowns ?? {}, [dropdowns]);
  const defaultButtons = useMemo(() => buttons ?? [], [buttons]);

  const numCols = useMemo(() => {
    if (isSm) return 1;
    if (isMd) return 2;
    if (isXl) return 4;
    return 3;
  }, [isSm, isMd, isXl]);

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

  const cohortId = useCoreSelector((state: CoreState) =>
    selectCurrentCohortId(state),
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
    accessibility: accessLevel,
    queryId: cohortId,
  });

  const chartKeys = useDeepCompareMemo(
    () => [...Object.keys(chartsSection?.charts ?? {}), ...Object.keys(charts)],
    [chartsSection?.charts, charts],
  );

  const {
    data: chartData,
    isSuccess: isChartSuccess,
    isFetching: isChartFetching,
    isError: isChartError,
  } = useGetAggsQuery(
    {
      type: index,
      fields: chartKeys,
      filters: cohortFilters,
      accessibility: accessLevel,
      filterSelf: true,
      queryId: cohortId,
    },
    {
      skip: chartKeys.length === 0,
    },
  );

  const cleanChartData = useDeepCompareMemo(() => {
    if (isChartSuccess && chartData) {
      const cleanedData: AggregationsData = {};
      Object.keys(summaryCharts).forEach((key) => {
        // remove empty keys
        cleanedData[key] = chartData[key].filter((x) =>
          typeof x.key !== 'string' ? true : x.key !== '',
        );

        const facetDef = facetDefinitions?.[key];
        if (facetDef?.excludeValues) {
          cleanedData[key] = cleanedData[key].filter((x) =>
            typeof x.key !== 'string'
              ? true
              : facetDef?.excludeValues?.includes(String(x.key)) === false,
          );
        }
      });
      return cleanedData;
    }
    return chartData;
  }, [chartData, isChartSuccess, summaryCharts]);

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
    [cohortFilters.root, data, isSuccess],
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
          useFieldNameToTitle: useFieldNameToTitle,
          useTotalCounts: undefined,
        },
        exact: {
          useGetFacetData: getEnumFacetData,
          useUpdateFacetFilters: partial(useUpdateFilters, index),
          useGetFacetFilters: partial(useGetFacetFilters, index),
          useClearFilter: partial(useClearFilters, index),
          useFilterExpanded: partial(useFilterExpandedState, index),
          useToggleExpandFilter: partial(useToggleExpandFilter, index),
          useFieldNameToTitle: useFieldNameToTitle,
          useTotalCounts: undefined,
        },
        multiselect: {
          useGetFacetData: getEnumFacetData,
          useUpdateFacetFilters: partial(useUpdateFilters, index),
          useGetFacetFilters: partial(useGetFacetFilters, index),
          useClearFilter: partial(useClearFilters, index),
          useFilterExpanded: partial(useFilterExpandedState, index),
          useToggleExpandFilter: partial(useToggleExpandFilter, index),
          useFieldNameToTitle: useFieldNameToTitle,
          useTotalCounts: undefined,
        },
        range: {
          useGetFacetData: getRangeFacetData,
          useUpdateFacetFilters: partial(useUpdateFilters, index),
          useGetFacetFilters: partial(useGetFacetFilters, index),
          useClearFilter: partial(useClearFilters, index),
          useFilterExpanded: partial(useFilterExpandedState, index),
          useToggleExpandFilter: partial(useToggleExpandFilter, index),
          useFieldNameToTitle: useFieldNameToTitle,
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
      const chartDefinitions = chartsSection?.charts ?? charts;

      const summaryCharts = Object.keys(chartDefinitions).reduce(
        (acc, field) => {
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
            [chartField]: chartDefinitions[field],
          };
        },
        {},
      );

      setSummaryCharts(summaryCharts);
    }
  }, [
    isSuccess,
    data,
    facetDefinitions,
    index,
    guppyConfig.fieldMapping,
    charts,
    chartsSection,
  ]);

  const {
    data: counts,
    isFetching: isCountsFetching,
    isError: isCountsError,
  } = useGetCountsQuery({
    type: index,
    filters: cohortFilters,
    accessibility: accessLevel,
    queryId: cohortId,
  });

  if (isCountsError || isAggsQueryError) {
    return <ErrorCard message="Unable to fetch data from server" />; // TODO: replace with configurable message
  }

  return (
    <div className="flex flex-col mt-3 relative px-4 bg-base-lightest w-full">
      <QueryExpression index={index} />

      {/* Flex container to ensure proper 25/75 split */}
      <div className="flex w-full">
        {/* Left panel - 25% */}
        <div
          id="cohort-builder-filters"
          className="flex-shrink-0 md:w-1/4 lg:w-1/5"
        >
          {filters?.tabs && (
            <DropdownPanel
              index={index}
              filters={filters}
              tabTitle={tabTitle}
              facetDefinitions={facetDefinitions}
              facetDataHooks={facetDataHooks}
              onAccessChange={setAccessLevel}
              accessLevel={accessLevel}
              showAccessLevel={showAccessLevel}
            />
          )}
        </div>

        {/* Right content - 75% */}
        <div
          id="cohort-builder-content"
          className="flex flex-col md:w-3/4 lg:w-4/5 pl-4"
        >
          {/* Top row with DownloadsPanel and CountsValue */}
          <div className="flex justify-between mb-2 ml-2">
            <DownloadsPanel
              dropdowns={defaultDropdowns}
              buttons={defaultButtons}
              loginForDownload={loginForDownload}
              index={index}
              totalCount={counts ?? 0}
              fields={table?.fields ?? []}
              filter={cohortFilters}
            />
            <CountsValue
              label={guppyConfig?.nodeCountTitle || toDisplayName(index)}
              counts={counts}
              isFetching={isCountsFetching}
              isError={isCountsError}
            />
          </div>

          {/* Charts Section */}
          {chartsSection?.enabled ? (
            <CollapsableCharts
              config={{ ...chartsSection, charts: summaryCharts }}
              data={cleanChartData ?? EmptyData}
              isSuccess={isChartSuccess}
            />
          ) : (
            <Charts
              charts={summaryCharts}
              data={cleanChartData ?? EmptyData}
              counts={counts}
              isSuccess={isChartSuccess}
              numCols={numCols}
            />
          )}

          {/* Table Section */}
          {table?.enabled && (
            <div className="mt-2 flex flex-col">
              <ExplorerTable
                index={index}
                tableConfig={table}
                accessibility={accessLevel}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
