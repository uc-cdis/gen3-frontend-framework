import React, { useMemo, useState } from 'react';
import { RepositoryConfiguration } from './types';
import { useMediaQuery } from '@mantine/hooks';
import {
  classifyFacets,
  EnumFacetDataHooks,
  FacetDataHooks,
  getAllFieldsFromFilterConfigs,
  processBucketData,
  removeIntersectionFromEnum,
  useClearFilters,
  useFieldNameToTitle,
  useGetFacetFilters,
  useUpdateFilters,
} from '../../../components/facets';
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
import {
  useDeepCompareCallback,
  useDeepCompareEffect,
  useDeepCompareMemo,
} from 'use-deep-compare';
import { partial } from 'lodash';
import {
  useCohortFilterCombineState,
  useFilterExpandedState,
  useSetCohortFilterCombineState,
  useToggleExpandFilter,
} from '../hooks';
import Stats from './Stats';
import { ErrorCard } from '../../../components/MessageCards';
import DropdownPanel from '../../../components/facets/Panels/DropdownPanel';
import ExplorerTable from '../ExplorerTable/ExplorerTable';

export const RepositoryPanel = ({
  guppyConfig,
  filters,
  table,
  dropdowns,
  buttons,
  loginForDownload,
  hooks,
}: RepositoryConfiguration) => {
  const isSm = useMediaQuery('(min-width: 639px)');
  const isMd = useMediaQuery('(min-width: 1373px)');
  const isXl = useMediaQuery('(min-width: 1600px)');

  const [accessLevel, setAccessLevel] = useState<Accessibility>(
    Accessibility.ALL,
  );

  const index = guppyConfig.dataType;
  const fields = useMemo(
    () => getAllFieldsFromFilterConfigs(filters?.tabs ?? []),
    [filters?.tabs],
  );

  const [facetDefinitions, setFacetDefinitions] = useState<
    Record<string, FacetDefinition>
  >({});

  const repositoryFilters = useCoreSelector((state: CoreState) =>
    selectIndexFilters(state, index),
  );

  const {
    data: facetData,
    isSuccess: isFacetsQuerySuccess,
    isFetching: isFacetsQueryFetching,
    isError: isFacetsQueryError,
  } = hooks.useGetFacetValuesQuery({
    type: index,
    fields: fields,
    filters: repositoryFilters,
  });

  const { data: fileSizeSliceData, isFetching: isFileSizeFetching } =
    hooks.useTotalFileSizeQuery({
      repositoryFilters: repositoryFilters,
    });

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
      };
    },
    [repositoryFilters.root, facetData, isFacetsQuerySuccess],
  );

  const facetDataHooks: Record<'enum', FacetDataHooks | EnumFacetDataHooks> =
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
          useUpdateCombineMode: () => null,
        },
      };
    }, [getEnumFacetData, index]);

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
        guppyConfig?.fieldMapping ?? [],
        configFacetDefs ?? {},
      );
      setFacetDefinitions(facetDefs);
    }
  }, [
    isFacetsQuerySuccess,
    facetData,
    facetDefinitions,
    index,
    guppyConfig.fieldMapping,
  ]);

  if (isFacetsQueryError) {
    return <ErrorCard message="Unable to fetch data from server" />; // TODO: replace with configurable message
  }

  return (
    <div className="flex flex-col mt-3 relative px-4 bg-base-lightest w-full">
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
              tabTitle="Files"
              facetDefinitions={facetDefinitions}
              facetDataHooks={facetDataHooks}
              showAccessLevel={false}
              onAccessChange={setAccessLevel}
              accessLevel={accessLevel}
            />
          )}
        </div>

        {/* Right content - 75% */}
        <div
          id="cohort-builder-content"
          className="flex flex-col md:w-3/4 lg:w-4/5 pl-4"
        >
          {/* Top row with DownloadsPanel and CountsValue */}
          <div className="flex justify-between mb-2 ml-2"></div>

          {/* Table Section */}
          {table?.enabled && (
            <div className="mt-2 flex flex-col">
              <div className="flex justify-between mb-2 ml-2">
                <Stats
                  totalFileCount={fileSizeSliceData.total_file_count}
                  totalCaseCount={fileSizeSliceData.total_case_count}
                  totalFileSize={fileSizeSliceData.total_file_size}
                  isFetching={isFileSizeFetching}
                />
              </div>
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
