import React, { useState } from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { useGetCSRFQuery } from '@gen3/core';
import { Center, Loader } from '@mantine/core';
import { CohortDiscoveryConfig } from './types';
import IndexPanel from './IndexPanel';
import { AppStore } from './appApi';

const persistor = persistStore(AppStore);

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
    <>
      <PersistGate persistor={persistor}>
        <div className="w-full h-full">
          <IndexPanel
            dataConfig={config.dataIndexes[0].dataConfig}
            tabTitle={config.dataIndexes[0].tabTitle}
            tabs={config.dataIndexes[0].tabs}
          />
        </div>
      </PersistGate>
    </>
  );
};

export default CohortDiscovery;
