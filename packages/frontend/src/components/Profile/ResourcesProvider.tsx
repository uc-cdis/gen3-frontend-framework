import React, {
  createContext, PropsWithChildren,
  ReactNode,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  AuthzMapping,
  selectUser,
  ServiceAndMethod,
  useCoreSelector,
  useGetAuthzMappingsQuery,
  UserProfile,
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


// Creates a react context hook from AuthzMapping and UserProfile APIs
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
const ResourcesProvider = ({ children } : PropsWithChildren ) => {
  const { data: userProfile = {} } = useCoreSelector(selectUser);
  const { data: authzMapping = {}, isLoading: isAuthZLoading } =
    useGetAuthzMappingsQuery();

  const [userProfileState, setUserProfileState] = useState<
    Partial<UserProfile>
  >({});
  const [authzMappingState, setAuthzMappingState] = useState<AuthzMapping>({});

  useEffect(() => {
    setUserProfileState(userProfile);
  }, [userProfile]);

  useEffect(() => {
    setAuthzMappingState(authzMapping);
  }, [authzMapping]);

  const servicesAndMethods = useMemo(() => {
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
