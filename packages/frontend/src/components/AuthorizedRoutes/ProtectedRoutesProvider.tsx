import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { AuthorizedRoutesConfig, RouteConfig } from '../../lib/authz/type';

export const DefaultRouteConfig: RouteConfig = {
  '/DataLibrary': {
    loginRequired: true,
    authz: ['/frontend/DataLibrary'],
  },
  '/Workspace': {
    loginRequired: true,
    authz: ['/workspaces'],
  },
  '/Profile': {
    loginRequired: true,
  },
  '/Login': {
    loginRequired: false,
  },
  '*': {
    loginRequired: false,
  },
};

const ProtectedRoutesContext = createContext<AuthorizedRoutesConfig>({
  routes: DefaultRouteConfig,
});

interface ProtectedRoutesProviderProps {
  config: AuthorizedRoutesConfig;
  children?: ReactNode | undefined;
}
const ProtectedRoutesProvider = ({
  config,
  children,
}: ProtectedRoutesProviderProps) => {
  const value = useMemo(() => ({ ...config }), [config]);

  return (
    <ProtectedRoutesContext.Provider value={value}>
      {children}
    </ProtectedRoutesContext.Provider>
  );
};
export default ProtectedRoutesProvider;
export const useProtectedRoutesContext = () =>
  useContext(ProtectedRoutesContext);
