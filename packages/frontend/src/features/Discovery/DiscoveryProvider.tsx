import React, { createContext } from 'react';
import { DiscoveryIndexConfig } from './types';
import { JSONObject } from '@gen3/core';

interface DiscoveryProviderValue {
  discoveryConfig: DiscoveryIndexConfig;
}

const DiscoveryContext = createContext<DiscoveryProviderValue>({
  discoveryConfig: {} as DiscoveryIndexConfig,
});

const useDiscoveryContext = () => {
  const context = React.useContext(DiscoveryContext);
  if (context === undefined) {
    throw Error(
      'Discovery must be used must be used inside of a DiscoveryContext',
    );
  }
  return context;
};

const DiscoveryProvider = ({
  children,
  discoveryIndexConfig,
}: {
  children: React.ReactNode;
  discoveryIndexConfig: DiscoveryIndexConfig;
}) => {

  return (
    <DiscoveryContext.Provider
      value={{
        discoveryConfig: discoveryIndexConfig,
      }}
    >
      {children}
    </DiscoveryContext.Provider>
  );
};

export { useDiscoveryContext, DiscoveryProvider as default };
