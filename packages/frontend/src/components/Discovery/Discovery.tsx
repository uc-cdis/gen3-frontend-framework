import React from 'react';
import { DiscoveryConfig } from './types';
import DiscoveryTable from './DiscoveryTable';

export interface DiscoveryProps {
  readonly discoveryConfig: DiscoveryConfig;
  readonly mdsURL?: string; // Override the default MDS URL
  readonly studyKey?: string; // Override the default MDS key
}
const Discovery = ({ discoveryConfig, mdsURL, studyKey }: DiscoveryProps) => {

  return (
    <div className="flex flex-col items-center p-2 m-2">
      <div className="flex flex-col w-full">
        <DiscoveryTable columns={discoveryConfig.studyColumns} dataURL={mdsURL} />
      </div>
    </div>
  );
};

export default Discovery;
