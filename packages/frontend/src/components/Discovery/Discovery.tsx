import React from 'react';
import { DiscoveryConfig } from './types';
import DiscoveryTable from './DiscoveryTable';
import DiscoveryConfigProvider from './DiscoveryConfigProvider';
import { MetadataPaginationParams, useGetAggMDSQuery } from '@gen3/core';

export interface DiscoveryProps {
  readonly discoveryConfig: DiscoveryConfig;
  readonly mdsURL?: string; // Override the default MDS URL
  readonly studyKey?: string; // Override the default MDS key

}

const useAggMDS = ( { pageSize, offset } : MetadataPaginationParams) => {
  return  useGetAggMDSQuery({
    url: 'https://healdata.org/mds',
    guidType: 'gen3_discovery',
    pageSize: pageSize,
    offset: offset,
  });
};

const Discovery = ({ discoveryConfig, mdsURL, studyKey }: DiscoveryProps) => {

  return (
    <div className="flex flex-col items-center p-2 m-2">
      <div className="flex flex-col w-full">
        <DiscoveryConfigProvider discoveryConfig={discoveryConfig}>
          <DiscoveryTable
            dataHook={useAggMDS}
          />
        </DiscoveryConfigProvider>
      </div>
    </div>
  );
};

export default Discovery;
