import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useMemo } from 'react';
import {
  type AuthzMapping,
  type CoreState,
  type ResourceAuthzMapping,
  selectUserDetails,
  type ServiceAndMethod,
  useCoreSelector,
  useGetAggregateWTSResourceAuthzMappingQuery,
  useGetAuthzMappingsQuery,
  type UserProfile,
} from '@gen3/core';

interface ServicesAndMethodsTypes {
  services: string[];
  methods: string[];
}

interface ResourcesProviderValue {
  userProfile?: Partial<UserProfile>;
  authzMapping?: AuthzMapping;
  meshAuthzMapping?: ResourceAuthzMapping;
  servicesAndMethods: ServicesAndMethodsTypes;
}

const EMPTY_SERVICES_AND_METHODS: ServicesAndMethodsTypes = {
  services: [],
  methods: [],
};
const EMPTY_AUTHZ: AuthzMapping = {};
const EMPTY_MESH_AUTHZ: ResourceAuthzMapping = {};

const ResourcesContext = createContext<ResourcesProviderValue>({
  authzMapping: EMPTY_AUTHZ,
  meshAuthzMapping: EMPTY_MESH_AUTHZ,
  userProfile: {},
  servicesAndMethods: EMPTY_SERVICES_AND_METHODS,
});

export const useResourcesContext = () => {
  const context = useContext(ResourcesContext);
  if (!context) {
    throw new Error(
      'useResourcesContext must be used within a ResourcesProvider',
    );
  }
  return context;
};

const ResourcesProvider = ({ children }: PropsWithChildren) => {
  const userProfile = useCoreSelector((state: CoreState) =>
    selectUserDetails(state),
  );
  const { data: authzMapping = EMPTY_AUTHZ, isLoading: isAuthZLoading } =
    useGetAuthzMappingsQuery();
  const {
    data: meshAuthzMapping = EMPTY_MESH_AUTHZ,
    isError: isMeshAuthZError,
  } = useGetAggregateWTSResourceAuthzMappingQuery();

  const resolvedMeshAuthzMapping = isMeshAuthZError
    ? EMPTY_MESH_AUTHZ
    : meshAuthzMapping;

  const servicesAndMethods = useMemo<ServicesAndMethodsTypes>(() => {
    if (isAuthZLoading || !authzMapping) {
      return EMPTY_SERVICES_AND_METHODS;
    }

    const services = new Set<string>();
    const methods = new Set<string>();

    Object.values(authzMapping).forEach((resource) => {
      if (Array.isArray(resource)) {
        resource.forEach((entry: ServiceAndMethod) => {
          if (entry?.service) services.add(entry.service);
          if (entry?.method) methods.add(entry.method);
        });
      }
    });

    return {
      services: Array.from(services),
      methods: Array.from(methods),
    };
  }, [authzMapping, isAuthZLoading]);

  const contextValue = useMemo<ResourcesProviderValue>(
    () => ({
      userProfile,
      authzMapping,
      meshAuthzMapping: resolvedMeshAuthzMapping,
      servicesAndMethods,
    }),
    [userProfile, authzMapping, resolvedMeshAuthzMapping, servicesAndMethods],
  );

  return (
    <ResourcesContext.Provider value={contextValue}>
      {children}
    </ResourcesContext.Provider>
  );
};

export default ResourcesProvider;
