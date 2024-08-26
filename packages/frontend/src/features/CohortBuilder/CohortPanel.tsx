import React, { useMemo, useState } from 'react';
import { Tabs } from '@mantine/core';
import { partial } from 'lodash';
import {
  type FacetDefinition,
  selectIndexFilters,
  useCoreSelector,
  useGetAggsQuery,
  FacetType,
  extractEnumFilterValue,
  CoreState,
  useGetCountsQuery,
} from '@gen3/core';
import { type CohortPanelConfig, type TabConfig, TabsConfig } from './types';
import { type SummaryChart } from '../../components/charts/types';
import { ErrorCard } from '../../components/MessageCards';
import { useMediaQuery } from '@mantine/hooks';

import {
  classifyFacets,
  extractRangeValues,
  getAllFieldsFromFilterConfigs,
  processBucketData,
  processRangeData,
  useGetFacetFilters,
  useUpdateFilters,
} from '../../components/facets/utils';
import { useClearFilters } from '../../components/facets/hooks';
import { FacetDataHooks } from '../../components/facets/types';
import { FiltersPanel } from './FiltersPanel';
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

const EmptyData = {};

interface TabbablePanelProps {
  filters: TabsConfig;
  tabTitle: string;
  facetDefinitions: Record<string, FacetDefinition>;
  facetDataHooks: Record<FacetType, FacetDataHooks>;
}

const TabbedPanel = ({
  filters,
  tabTitle,
  facetDefinitions,
  facetDataHooks,
}: TabbablePanelProps) => {
  return (
    <div>
      <Tabs
        variant="pills"
        orientation="vertical"
        keepMounted={false}
        defaultValue={filters?.tabs[0].title ?? 'Filters'}
      >
        <Tabs.List>
          {filters.tabs.map((tab: TabConfig) => {
            return (
              <Tabs.Tab value={tab.title} key={`${tab.title}-tab`}>
                {tab.title}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>

        {filters.tabs.map((tab: TabConfig) => {
          return (
            <Tabs.Panel
              value={tab.title}
              key={`filter-${tab.title}-tabPanel`}
              className="w-1/4"
            >
              {Object.keys(facetDefinitions).length > 0 ? (
                <FiltersPanel
                  fields={tab.fields.reduce((acc, field) => {
                    return [...acc, facetDefinitions[field]];
                  }, [] as FacetDefinition[])}
                  dataFunctions={facetDataHooks}
                  valueLabel={tabTitle}
                />
              ) : null}
            </Tabs.Panel>
          );
        })}
      </Tabs>
    </div>
  );
};

const SinglePanel = ({
  filters,
  tabTitle,
  facetDefinitions,
  facetDataHooks,
}: TabbablePanelProps) => {
  return (
    <div>
      {Object.keys(facetDefinitions).length > 0 ? (
        <FiltersPanel
          fields={filters.tabs[0].fields.reduce((acc, field) => {
            return [...acc, facetDefinitions[field]];
          }, [] as FacetDefinition[])}
          dataFunctions={facetDataHooks}
          valueLabel={tabTitle}
        />
      ) : null}
    </div>
  );
};

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
    isError: isAggsQueryError,
  } = useGetAggsQuery({
    type: index,
    fields: fields,
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

  // Set up the hooks for the facet components to use based on the required index
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const facetDataHooks: Record<FacetType, FacetDataHooks> =
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
        exact: {
          useGetFacetData: getEnumFacetData,
          useUpdateFacetFilters: partial(useUpdateFilters, index),
          useGetFacetFilters: partial(useGetFacetFilters, index),
          useClearFilter: partial(useClearFilters, index),
          useTotalCounts: undefined,
        },
        multiselect: {
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
        guppyConfig.fieldMapping,
        configFacetDefs ?? {},
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
    <div className="flex mt-3 relative">
      <div>
        {filters?.tabs === undefined ? null : filters?.tabs.length > 1 ? (
          <TabbedPanel
            filters={filters}
            tabTitle={tabTitle}
            facetDefinitions={facetDefinitions}
            facetDataHooks={facetDataHooks}
          />
        ) : (
          <SinglePanel
            filters={filters}
            tabTitle={tabTitle}
            facetDefinitions={facetDefinitions}
            facetDataHooks={facetDataHooks}
          />
        )}
      </div>
      <div className="w-full relative">
        <div className="flex flex-col">
          <CohortManager index={index} />

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
              label={guppyConfig.nodeCountTitle}
              counts={counts}
              isSuccess={isCountSuccess}
            />
          </div>
          <Charts
            index={index}
            charts={summaryCharts}
            data={data ?? EmptyData}
            counts={counts}
            isSuccess={isSuccess}
            numCols={numCols}
          />
          {table?.enabled ? (
            <div className="mt-2 flex flex-col">
              <div className="grid">
                <ExplorerTable index={index} tableConfig={table} />
              </div>
            </div>
          ) : (
            false
          )}
        </div>
      </div>
    </div>
  );
};
