import React, { createContext } from 'react';
import type { DiscoveryIndexConfig } from './types';

interface DiscoveryProviderValue {
  discoveryConfig: DiscoveryIndexConfig;
  selectedTags: { [key: string]: boolean };
  setSelectedTags: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
}

const DiscoveryContext = createContext<DiscoveryProviderValue>({
  discoveryConfig: {} as DiscoveryIndexConfig,
  selectedTags: {},
  setSelectedTags: () => {},
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
  discoveryConfig,
  selectedTags,
  setSelectedTags,
}: {
  children: React.ReactNode;
} & DiscoveryProviderValue) => {
  return (
    <DiscoveryContext.Provider
      value={{
        discoveryConfig,
        selectedTags,
        setSelectedTags,
      }}
    >
      {children}
    </DiscoveryContext.Provider>
  );
};

export { useDiscoveryContext, DiscoveryContext, DiscoveryProvider as default };
