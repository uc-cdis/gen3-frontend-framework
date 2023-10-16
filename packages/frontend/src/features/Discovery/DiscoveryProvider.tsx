import React, { createContext } from 'react';
import { DiscoveryConfig } from './types';
import { JSONObject } from '@gen3/core';

interface DiscoveryProviderValue {
  discoveryConfig: DiscoveryConfig;
  setStudyDetails: React.Dispatch<React.SetStateAction<JSONObject>>;
  studyDetails: JSONObject;
}

const DiscoveryContext = createContext<DiscoveryProviderValue>({
  discoveryConfig: {} as DiscoveryConfig,
  setStudyDetails: () => null,
  studyDetails: {} as JSONObject,
});

const useDiscoveryContext = () => {
  const context = React.useContext(DiscoveryContext);
  if (context === undefined) {
    throw Error(
      'Discovery must be used  must be used inside of a DiscoveryContext',
    );
  }
  return context;
};

const DiscoveryProvider = ({
  children,
  discoveryConfig,
}: {
  children: React.ReactNode;
  discoveryConfig: DiscoveryConfig;
}) => {
  const [studyDetails, setStudyDetails] = React.useState<JSONObject>({});
  return (
    <DiscoveryContext.Provider
      value={{ discoveryConfig, setStudyDetails, studyDetails }}
    >
      {children}
    </DiscoveryContext.Provider>
  );
};

export { useDiscoveryContext, DiscoveryProvider as default };
