import { createContext, } from 'react';
import { DiscoveryConfig } from './types';

const DiscoveryConfigContext  = createContext({ } as DiscoveryConfig);

const DiscoveryConfigProvider = ({ children, discoveryConfig }: { children: React.ReactNode, discoveryConfig: DiscoveryConfig }) => {
  return (
    <DiscoveryConfigContext.Provider value={discoveryConfig}>
      {children}
    </DiscoveryConfigContext.Provider>
  );
};


export { DiscoveryConfigContext, DiscoveryConfigProvider as default};
