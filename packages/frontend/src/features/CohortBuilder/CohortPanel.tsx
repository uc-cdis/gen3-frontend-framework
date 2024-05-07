import { useMemo, useState } from 'react';
import { Loader, Select } from '@mantine/core';
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
  useGetFieldsForIndexQuery
} from '@gen3/core';
import { type CohortPanelConfig, type TabsConfig } from './types';
import { type SummaryChart } from '../../components/charts/types';

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
import { FacetRequiredHooks } from '../../components/facets/types';
import { FiltersPanel } from './FiltersPanel';
import CohortManager from './CohortManager';
import { Charts } from '../../components/charts';
import ExplorerTable from './ExplorerTable/ExplorerTable';
import CountsValue from '../../components/counts/CountsValue';
import DownloadsPanel from './DownloadsPanel';
import { useDeepCompareCallback, useDeepCompareEffect, useDeepCompareMemo } from 'use-deep-compare';



const EmptyData = {};

interface TabbablePanelProps {
  filters: TabsConfig;
  tabTitle: string;
  facetDefinitions: Record<string, FacetDefinition>;
  facetDataHooks: Record<FacetType, FacetRequiredHooks>;
}

const TabbedPanel = ({
  filters,
  tabTitle,
  facetDefinitions,
  facetDataHooks,
}: TabbablePanelProps) => {
  const [tab, setTab] = useState(filters?.tabs[0].title ?? 'Filters');
  const [collapse, setCollapse] = useState(false);
  const filterOptions = [...filters.tabs.map(({ title }) => title)];
  const handleTabChange = (tabValue: string) => {
    if (!tabValue) return;
    setTab(tabValue);
  }
  const toggleCollapse = () => {
    setCollapse(c => !c)
  }
  return (
    <div className="flex flex-col">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold text-md">Filter Set</h3>
        <button className="text-blue-300 text-sm" onClick={toggleCollapse}>Collapse All</button>
      </div>
      <Select
        data={filterOptions}
        value={tab}
        transitionProps={{ transition: 'pop-top-left', duration: 50, timingFunction: 'ease' }}
        onChange={handleTabChange}
      />
      <div className="mt-2">
        {Object.keys(facetDefinitions).length > 0 ? (
          <FiltersPanel
            fields={filters?.tabs?.[filterOptions.indexOf(tab)].fields.reduce((acc, field) => {
              return [...acc, facetDefinitions[field]];
            }, [] as FacetDefinition[])}
            dataFunctions={facetDataHooks}
            valueLabel={tabTitle}
            collapse={collapse}
          />
        ) : null}
      </div>
    </div>
  );
};

const SinglePanel = ({
  filters,
  tabTitle,
  facetDefinitions,
  facetDataHooks,
}: TabbablePanelProps) => {
  const [collapse, setCollapse] = useState(false);
  const toggleCollapse = () => {
    setCollapse(c => !c)
  }
  return (
    <div>
      <button onClick={toggleCollapse}>Collapse All</button>
      {Object.keys(facetDefinitions).length > 0 ? (
        <FiltersPanel
          fields={filters.tabs[0].fields.reduce((acc, field) => {
            return [...acc, facetDefinitions[field]];
          }, [] as FacetDefinition[])}
          dataFunctions={facetDataHooks}
          valueLabel={tabTitle}
          collapse={collapse}
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
  const index = guppyConfig.dataType;
  const fields = useMemo(() => getAllFieldsFromFilterConfigs(filters?.tabs ?? []), []);

  const [facetDefinitions, setFacetDefinitions] = useState<
    Record<string, FacetDefinition>
  >({});

  const [summaryCharts, setSummaryCharts] = useState<
    Record<string, SummaryChart>
  >({});

  const cohortFilters = useCoreSelector((state: CoreState) =>
    selectIndexFilters(state, index),
  );

  const { data, isSuccess } = useGetAggsQuery({
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
  const facetDataHooks: Record<FacetType, FacetRequiredHooks> = useDeepCompareMemo(() => {
    return {
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

  // Set the facet definitions based on the data only the first time the data is loaded
  useDeepCompareEffect(() => {
    if (isSuccess && Object.keys(facetDefinitions).length === 0) {
      const facetDefs = classifyFacets(data, index, guppyConfig.fieldMapping);
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
  }, [isSuccess, data, facetDefinitions, index, guppyConfig.fieldMapping, charts]);

  const { data: counts, isSuccess: isCountSuccess, isLoading } = useGetCountsQuery({
    type: index,
    filters: cohortFilters,
  });

  if (isLoading) {
    return (
      <div className="flex w-100 h-100 relative justify-center"><Loader variant="dots" /> </div>);
  }
  return (
    <div className="flex mt-3">
      <div className="w-1/5">
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
      <div className="w-4/5 relative">

        <div className="flex flex-col">
          <CohortManager index={index} />

          <div className="flex justify-between mb-1 ml-2">
            <DownloadsPanel
              dropdowns={dropdowns ?? {}}
              buttons={buttons ?? []}
              loginForDownload={loginForDownload}
              index={index}
              totalCount={counts ?? 0}
              fields={fields}
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
          />
          {table?.enabled ? (
            <div className="flex flex-col">
              <div className="grid">
                <ExplorerTable index={index} tableConfig={table} />
              </div>
            </div>
          ) : false}
        </div>
      </div>
    </div>
  );
};
