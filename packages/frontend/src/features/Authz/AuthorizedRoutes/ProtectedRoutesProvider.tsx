import React, { createContext, ReactNode, useContext } from 'react';
import { AuthorizedRoutesConfig } from '../../../lib/authz/type';

export const DefaultRouteConfig : AuthorizedRoutesConfig= {
  enableAuthz: false,
  routes: {
    "/DataLibrary": {
      "loginRequired": true,
      "authzResources": [
        "/frontend/DataLibrary"
      ]
    },
    "/Workspace": {
      "loginRequired": true,
      "authzResources": ["/workspaces"]
    },
    "/Profile": {
      "loginRequired": true
    },
    "/Login": {
      "loginRequired": false
    },
    "*" : {
      "loginRequired": false
    }
  },
};

export interface AuthzRoutesContextProps {
  config: AuthorizedRoutesConfig;
}

const ProtectedRoutesContext = createContext<AuthorizedRoutesConfig>({
  routes: DefaultRouteConfig,
  enableAuthz: false,
});

interface ProtectedRoutesProviderProps {
  config: AuthorizedRoutesConfig;
  children?: ReactNode | undefined;
}
const ProtectedRoutesProvider = ({ config, children } : ProtectedRoutesProviderProps) => {
  return (
    <ProtectedRoutesContext.Provider value={{...config}}>
      {children}
    </ProtectedRoutesContext.Provider>
  );
};

export default ProtectedRoutesProvider;

export const useProtectedRoutesContext = () => useContext(ProtectedRoutesContext);
