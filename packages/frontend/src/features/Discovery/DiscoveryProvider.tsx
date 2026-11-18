import React, { createContext } from 'react';
import type { DiscoveryIndexConfig } from './types';
import type { AccessLevel } from '../../utils';

interface DiscoveryProviderValue {
  discoveryConfig: DiscoveryIndexConfig;
  selectedTags: { [key: string]: boolean };
  setSelectedTags: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
  selectedAccessLevels: number[];
  setSelectedAccessLevels: React.Dispatch<React.SetStateAction<number[]>>;
  enabledAccessLevels: Set<AccessLevel>;
}

const DiscoveryContext = createContext<DiscoveryProviderValue>({
  discoveryConfig: {} as DiscoveryIndexConfig,
  selectedTags: {},
  setSelectedTags: () => {},
  selectedAccessLevels: [],
  setSelectedAccessLevels: () => [],
  enabledAccessLevels: new Set(),
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
  selectedAccessLevels,
  setSelectedAccessLevels,
  enabledAccessLevels,
}: {
  children: React.ReactNode;
} & DiscoveryProviderValue) => {
  return (
    <DiscoveryContext.Provider
      value={{
        discoveryConfig,
        selectedTags,
        setSelectedTags,
        selectedAccessLevels,
        setSelectedAccessLevels,
        enabledAccessLevels,
      }}
    >
      {children}
    </DiscoveryContext.Provider>
  );
};

export { useDiscoveryContext, DiscoveryContext, DiscoveryProvider as default };
