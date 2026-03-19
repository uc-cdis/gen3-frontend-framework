import React, { createContext, useState } from 'react';
import { DiscoveryIndexConfig } from './types';
import { JSONObject } from '@gen3/core';

interface DiscoveryProviderValue {
  discoveryConfig: DiscoveryIndexConfig;
  selectedTags: { [key: string]: boolean }; // Include selectedTags in the context
  setSelectedTags: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >; // Include setter
}

const DiscoveryContext = createContext<DiscoveryProviderValue>({
  discoveryConfig: {} as DiscoveryIndexConfig,
  selectedTags: {},
  setSelectedTags: () => {}, // Default function to avoid undefined error
});

const useDiscoveryContext = () => {
  const context = React.useContext(DiscoveryContext);
  if (context === undefined) {
    throw new Error('Discovery must be used inside of a DiscoveryContext');
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
  const [selectedTags, setSelectedTags] = useState<{ [key: string]: boolean }>(
    {},
  ); // Initialize selectedTags state

  return (
    <DiscoveryContext.Provider
      value={{
        discoveryConfig: discoveryIndexConfig,
        selectedTags, // Provide selectedTags
        setSelectedTags, // Provide setter function
      }}
    >
      {children}
    </DiscoveryContext.Provider>
  );
};

export { useDiscoveryContext, DiscoveryProvider as default };
