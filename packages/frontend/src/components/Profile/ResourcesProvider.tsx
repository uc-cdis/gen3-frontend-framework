import React, {
  createContext,
  PropsWithChildren,
  useState,
} from 'react';
import {
  useDeepCompareEffect,
  useDeepCompareMemo
} from 'use-deep-compare';
import {
  AuthzMapping, type CoreState,
  ServiceAndMethod,
  useCoreSelector,
  useGetAuthzMappingsQuery,
  UserProfile,
  selectUserDetails
} from '@gen3/core';

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

// Creates a React context hook from AuthzMapping and UserProfile APIs
export const useResourcesContext = () => {
  const context = React.useContext(ResourcesContext);
  if (context === undefined) {
    throw Error(
      'Resources must be used  must be used inside of a ResourcesContext',
    );
  }
  return context;
};

/**
 * ResourcesProvider fetches permissions data via the authzApi and caches this data
 * for use in other components
 * @param children - List all the API keys for the current user
 * @returns: A provider element that can pass data to other child elements.
 */
const ResourcesProvider = ({ children }: PropsWithChildren) => {
  const  userProfile = useCoreSelector((state: CoreState) => selectUserDetails(state));
  const { data: authzMapping = {}, isLoading: isAuthZLoading } =
    useGetAuthzMappingsQuery();

  const [userProfileState, setUserProfileState] = useState<
    Partial<UserProfile>
  >({});
  const [authzMappingState, setAuthzMappingState] = useState<AuthzMapping>({});

  useDeepCompareEffect(() => {
    setUserProfileState(userProfile);
  }, [userProfile]);

  useDeepCompareEffect(() => {
    setAuthzMappingState(authzMapping);
  }, [authzMapping]);

  const servicesAndMethods = useDeepCompareMemo(() => {
    if (isAuthZLoading) return { services: [], methods: [] };
    if (!authzMappingState) return { services: [], methods: [] };
    const results = Object.values<ServiceAndMethod[]>(authzMappingState).reduce(
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
  }, [authzMappingState, isAuthZLoading]);

  return (
    <ResourcesContext.Provider
      value={{
        userProfile: userProfileState,
        authzMapping: authzMappingState,
        servicesAndMethods,
      }}
    >
      {children}
    </ResourcesContext.Provider>
  );
};

export default ResourcesProvider;
