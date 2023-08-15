import React,  { createContext, } from 'react';
import { DiscoveryConfig } from './types';
import { JSONObject } from "@gen3/core";

interface DiscoveryConfigProviderValue {
  discoveryConfig: DiscoveryConfig;
  setStudyDetails: React.Dispatch<React.SetStateAction<JSONObject | undefined>>;
  studyDetails?: JSONObject ;
}

const DiscoveryConfigContext  = createContext<DiscoveryConfigProviderValue>(
  {
    discoveryConfig: {} as DiscoveryConfig,
    setStudyDetails: () => {},
    studyDetails: undefined
});

const useDiscoveryConfigContext = () => {
  const context = React.useContext(DiscoveryConfigContext)
  if (context === undefined) {
    throw Error('RadioGroupItem must be used inside of a RadioGroup, ' + 'otherwise it will not function correctly.')
  }
  return context;
}


const DiscoveryConfigProvider = ({ children, discoveryConfig }: { children: React.ReactNode, discoveryConfig: DiscoveryConfig }) => {
  const [studyDetails, setStudyDetails] = React.useState<JSONObject|undefined>(undefined);
  return (
    <DiscoveryConfigContext.Provider value={{discoveryConfig, setStudyDetails, studyDetails}}>
      {children}
    </DiscoveryConfigContext.Provider>
  );
};

export { useDiscoveryConfigContext, DiscoveryConfigProvider as default};
