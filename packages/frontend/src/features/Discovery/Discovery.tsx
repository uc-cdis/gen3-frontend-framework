import React, { useState } from 'react';
import { DiscoveryConfig, DiscoveryTableDataHook } from './types';
import DiscoveryTable from './DiscoveryTable';
import DiscoveryProvider from './DiscoveryProvider';
import { MetadataPaginationParams, useGetAggMDSQuery } from '@gen3/core';
import AdvancedSearchPanel from './Search/AdvancedSearchPanel';
import { MRT_PaginationState, MRT_SortingState } from 'mantine-react-table';
import { useDisclosure } from '@mantine/hooks';
import { Button } from '@mantine/core';

export interface DiscoveryProps {
  discoveryConfig: DiscoveryConfig;
  dataHook?: DiscoveryTableDataHook;
}

const useAggMDS = ({ pageSize, offset }: MetadataPaginationParams) => {
  return useGetAggMDSQuery({
    url: 'https://healdata.org/mds',
    guidType: 'gen3_discovery',
    pageSize: pageSize,
    offset: offset,
  });
};

const Discovery = ({
  discoveryConfig,
  dataHook = useAggMDS,
}: DiscoveryProps) => {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading, isFetching, isError } = dataHook({
    pageSize: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  });

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [showAdvancedSearch, { toggle: toggleAdvancedSearch }] =
    useDisclosure(false);
  return (
    <div className="flex flex-col items-center p-2 m-2">
      <div className="w-full">
        <DiscoveryProvider discoveryConfig={discoveryConfig}>
          <div className="flex flex-row">
            <Button onClick={toggleAdvancedSearch} color="accent">
              Filters
            </Button>
          </div>
          <div className="flex justify-start">
            <AdvancedSearchPanel
              advSearchFilters={discoveryConfig.features.advSearchFilters}
              studies={data?.data ?? []}
              uidField={discoveryConfig.minimalFieldMapping?.uid}
              opened={showAdvancedSearch}
            />

            <DiscoveryTable
              data={data}
              isLoading={isLoading}
              isFetching={isFetching}
              isError={isError}
              setPagination={setPagination}
              setSorting={setSorting}
              pagination={pagination}
              sorting={sorting}
            />

          </div>
        </DiscoveryProvider>
      </div>
    </div>
  );
};

export default Discovery;
