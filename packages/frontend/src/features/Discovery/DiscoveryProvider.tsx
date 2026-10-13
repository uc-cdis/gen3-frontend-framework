import React, { createContext, useMemo, useState } from 'react';
import type { DiscoveryIndexConfig } from './types';
import type { AccessLevel } from '../../utils';
import { supportedAccessLevels } from './utils';

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
  discoveryIndexConfig,
}: {
  children: React.ReactNode;
  discoveryIndexConfig: DiscoveryIndexConfig;
}) => {
  const enabledAccessLevels = useMemo(
    () => new Set<AccessLevel>(supportedAccessLevels(discoveryIndexConfig)),
    [discoveryIndexConfig],
  );

  const [selectedTags, setSelectedTags] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [selectedAccessLevels, setSelectedAccessLevels] = useState<number[]>(
    () => [...enabledAccessLevels],
  );

  return (
    <DiscoveryContext.Provider
      value={{
        discoveryConfig: discoveryIndexConfig,
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
