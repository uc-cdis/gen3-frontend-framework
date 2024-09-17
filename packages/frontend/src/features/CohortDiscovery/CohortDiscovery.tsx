import React, { useState } from 'react';

import {
  CoreState,
  selectIndexFilters,
  useCoreSelector,
  useGetCSRFQuery,
} from '@gen3/core';
import { Center, Loader } from '@mantine/core';
import { CohortDiscoveryConfig, CohortDiscoveryGroup } from './types';
import IndexPanel from './IndexPanel';

const CohortDiscovery = (config: CohortDiscoveryConfig) => {
  const { isLoading } = useGetCSRFQuery(); // need for Guppy

  if (isLoading) {
    return (
      <Center maw={400} h={100} mx="auto">
        <Loader variant="dots" />
      </Center>
    );
  }

  console.log('CohortDiscovery', config);

  return (
    <div>
      <IndexPanel
        dataConfig={config.dataIndexes[0].dataConfig}
        tabTitle={config.dataIndexes[0].tabTitle}
        tabs={config.dataIndexes[0].tabs}
      />
    </div>
  );
};

export default CohortDiscovery;
