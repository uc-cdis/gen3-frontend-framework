import React, { createContext, ReactNode, useMemo } from 'react';
//import { AuthzMapping, selectUser, useCoreSelector, useGetAuthzMappingsQuery, UserProfile, ServiceAndMethod } from "@gen3/core";
import { AuthzMapping, UserProfile, ServiceAndMethod } from '@gen3/core';

// For development testing import the following:
import devAuthzMapping from './data/authzMapping.json';
import userAuthz from './data/userAuthz.json';

interface ServicesAndMethodsTypes {
  services: string[];
  methods: string[];
}

interface ServicesAndMethodsTypesAsSets {
  services: Set<string>;
  methods: Set<string>;
}

interface ResourcesProviderValue {
  userProfile?: Partial<UserProfile>;
  authzMapping?: AuthzMapping;
  servicesAndMethods: ServicesAndMethodsTypes;
}

const ResourcesContext = createContext<ResourcesProviderValue>({
  authzMapping: {} as AuthzMapping,
  userProfile: {} as UserProfile,
  servicesAndMethods: { services: [], methods: [] } as ServicesAndMethodsTypes,
});

export const useResourcesContext = () => {
  const context = React.useContext(ResourcesContext);
  if (context === undefined) {
    throw Error(
      'Resources must be used  must be used inside of a ResourcesContext',
    );
  }
  return context;
};

const ResourcesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // const { data: userProfile } = useCoreSelector(selectUser);
  //const { data: authzMapping, isLoading: isAuthZLoading } = useGetAuthzMappingsQuery();

  // TODO remove this when we have a real authzMapping
  const isAuthZLoading = false;
  const userProfile = userAuthz;
  const authzMapping = devAuthzMapping;

  /**
   * This takes the mapping and find all the unique services and methods in the mapping
   * This is then used to build the columns and content of the ResourcesTable
   */
  const servicesAndMethods = useMemo(() => {
    if (isAuthZLoading) return { services: [], methods: [] };
    if (!authzMapping) return { services: [], methods: [] };
    const results = Object.values<ServiceAndMethod[]>(authzMapping).reduce(
      (acc, resource) => {
        return resource.reduce((acc: ServicesAndMethodsTypesAsSets, entry) => {
          acc.services.add(entry.service);
          acc.methods.add(entry.method);
          return acc;
        }, acc);
      },
      {
        services: new Set<string>(),
        methods: new Set<string>(),
      } as ServicesAndMethodsTypesAsSets,
    );
    return {
      services: Array.from(results.services),
      methods: Array.from(results.methods),
    };
  }, [authzMapping, isAuthZLoading]);

  return (
    <ResourcesContext.Provider
      value={{
        userProfile: userProfile,
        authzMapping: authzMapping,
        servicesAndMethods,
      }}
    >
      {children}
    </ResourcesContext.Provider>
  );
};

export default ResourcesProvider;
