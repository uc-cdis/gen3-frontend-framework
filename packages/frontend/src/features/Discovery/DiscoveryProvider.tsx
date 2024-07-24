import React, { createContext } from 'react';
import { DiscoveryIndexConfig } from './types';
import { JSONObject } from '@gen3/core';

interface DiscoveryProviderValue {
  discoveryConfig: DiscoveryIndexConfig;
  setStudyDetails: React.Dispatch<React.SetStateAction<JSONObject>>;
  studyDetails: JSONObject;
}

const DiscoveryContext = createContext<DiscoveryProviderValue>({
  discoveryConfig: {} as DiscoveryIndexConfig,
  setStudyDetails: () => null,
  studyDetails: {} as JSONObject,
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
  const [studyDetails, setStudyDetails] = React.useState<JSONObject>({});

  return (
    <DiscoveryContext.Provider
      value={{
        discoveryConfig: discoveryIndexConfig,
        setStudyDetails,
        studyDetails,
      }}
    >
      {children}
    </DiscoveryContext.Provider>
  );
};

export { useDiscoveryContext, DiscoveryProvider as default };
