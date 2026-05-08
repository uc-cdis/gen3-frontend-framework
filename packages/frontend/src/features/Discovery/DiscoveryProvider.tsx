import React, { createContext, useState } from 'react';
import { DiscoveryIndexConfig } from './types';

interface DiscoveryProviderValue {
  discoveryConfig: DiscoveryIndexConfig;
  selectedTags: { [key: string]: boolean };
  setSelectedTags: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
  selectedAccessibility: number[];
  setSelectedAccessibility: React.Dispatch<React.SetStateAction<number[]>>;
}

const DiscoveryContext = createContext<DiscoveryProviderValue>({
  discoveryConfig: {} as DiscoveryIndexConfig,
  selectedTags: {},
  setSelectedTags: () => {},
  selectedAccessibility: [],
  setSelectedAccessibility: () => [],
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
  );
  const [selectedAccessibility, setSelectedAccessibility] = useState<number[]>(
    [],
  );

  return (
    <DiscoveryContext.Provider
      value={{
        discoveryConfig: discoveryIndexConfig,
        selectedTags,
        setSelectedTags,
        selectedAccessibility,
        setSelectedAccessibility,
      }}
    >
      {children}
    </DiscoveryContext.Provider>
  );
};

export { useDiscoveryContext, DiscoveryProvider as default };
