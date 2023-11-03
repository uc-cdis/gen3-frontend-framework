import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  type FacetDefinition,
  selectIndexFilters,
  useCoreSelector,
  useGetAggsQuery,
  FacetType,
  extractEnumFilterValue,
  CoreState,
} from '@gen3/core';

import { type CohortPanelConfig, type TabConfig } from './types';
import { type SummaryChart} from "../../components/charts/types";

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
import { partial } from 'lodash';
import { FiltersPanel } from './FiltersPanel';
import CohortManager from './CohortManager';
import { Charts } from '../../components/charts';
import ExplorerTable from './ExplorerTable/ExplorerTable';
import CountsValue from '../../components/counts/CountsValue';
import { Tabs } from '@mantine/core';
;

export const CohortPanel = ({
  guppyConfig,
  filters,
  charts = {},
  table,
  tabTitle,
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

  const getEnumFacetData = useCallback(
    (field: string) => {
      console.log("field", field, cohortFilters);
      return {
        data: processBucketData(data?.[field]),
        enumFilters: field in cohortFilters.root ? extractEnumFilterValue(cohortFilters.root[field]) : undefined,
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
  }, [isSuccess, data]);

  return (
    <div className="flex mt-3">
      <div className="basis-1/4">
        <Tabs
          variant="pills"
          orientation="vertical"
          keepMounted={false}
          defaultValue={filters?.tabs[0].title ?? 'Filters'}
        >
          <Tabs.List>
            {filters?.tabs.map((tab: TabConfig) => {
              return (
              <Tabs.Tab value={tab.title} key={`${tab.title}-tab`}>
                {tab.title}
              </Tabs.Tab>
            );})}
          </Tabs.List>

          {filters?.tabs.map((tab: TabConfig) => {
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
      <div>
        <div className="flex flex-col">
          <CohortManager index={index} />
          <div className="flex justify-end">
            <CountsValue
              label={guppyConfig.nodeCountTitle}
              index={index}
              filters={cohortFilters}
            />
          </div>
          <Charts
            index={index}
            charts={summaryCharts}
            data={data ?? {}}
            isSuccess={isSuccess}
          />
          {table?.enabled ? (
            <div className="grid">
              <ExplorerTable index={index} tableConfig={table} />
            </div>
          ) : (
            false
          )}
        </div>
      </div>
    </div>
  );
};
