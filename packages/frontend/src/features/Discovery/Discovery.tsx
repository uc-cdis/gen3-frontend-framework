import React, { useState } from 'react';
import { DiscoveryConfig, DiscoveryTableDataHook } from './types';
import DiscoveryTable from './DiscoveryTable';
import DiscoveryConfigProvider from './DiscoveryConfigProvider';
import { MetadataPaginationParams, useGetAggMDSQuery } from '@gen3/core';
import AdvancedSearchPanel from './Search/AdvancedSearchPanel';
import { MRT_PaginationState, MRT_SortingState } from 'mantine-react-table';

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

  return (
    <div className="flex flex-col items-center p-2 m-2">
      <div className="w-full">
        <DiscoveryConfigProvider discoveryConfig={discoveryConfig}>
          <div className="flex flex-row justify-between">
              <AdvancedSearchPanel
                advSearchFilters={discoveryConfig.features.advSearchFilters}
                studies={data?.data ?? []}
                uidField={discoveryConfig.minimalFieldMapping?.uid}
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
        </DiscoveryConfigProvider>
      </div>
    </div>
  );
};

export default Discovery;
