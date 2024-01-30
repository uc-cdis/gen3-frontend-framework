import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { AddButtonsArrayToDropdowns, AddButtonsToDropdown } from './utils';

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
  const fields = getAllFieldsFromFilterConfigs(filters?.tabs ?? []);

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

  const dropdownsWithButtons = AddButtonsToDropdown(
    AddButtonsArrayToDropdowns(dropdowns),
    buttons,
  );

  const actionButtons = buttons
    ? buttons.filter((button) => button?.dropdownId === undefined)
    : [];

  const getEnumFacetData = useCallback(
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

  const getRangeFacetData = useCallback(
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
  const facetDataHooks: Record<FacetType, FacetRequiredHooks> = useMemo(() => {
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
  useEffect(() => {
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

  const { data: counts, isSuccess: isCountSuccess } = useGetCountsQuery({
    type: index,
    filters: cohortFilters,
  });

  return (
    <div className="flex mt-3">
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
      <div className="w-full">
        <div className="flex flex-col">
          <CohortManager index={index} />

          <div className="flex justify-between mb-1 ml-2">
            <DownloadsPanel
              dropdowns={dropdownsWithButtons}
              buttons={actionButtons}
              loginForDownload={loginForDownload}
            />
            .
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
