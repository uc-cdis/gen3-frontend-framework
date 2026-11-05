import type { PropsWithChildren, ReactElement } from 'react';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { Loader, LoadingOverlay } from '@mantine/core';
import {
  type CoreState,
  type LoginStatus,
  selectUserAuthStatus,
  useCoreSelector,
  useGetAggregateWTSResourceAuthzMappingQuery,
  useGetAuthzMappingsQuery,
} from '@gen3/core';
import ErrorCard from '../MessageCards/ErrorCard';

interface AuthzMappingsStatus {
  /** first load: no mapping has been received yet */
  isLoading: boolean;
  /** any request in flight, including refetches after a login change */
  isFetching: boolean;
  isError: boolean;
}

// defaults to ready so layouts render without the provider (e.g. Storybook, tests)
const AuthzMappingsContext = createContext<AuthzMappingsStatus>({
  isLoading: false,
  isFetching: false,
  isError: false,
});

export const useAuthzMappingsStatus = (): AuthzMappingsStatus =>
  useContext(AuthzMappingsContext);

const isSettledLoginStatus = (status: LoginStatus): boolean =>
  status === 'authenticated' || status === 'unauthenticated';

interface AuthzMappingProviderProps {
  enableWTS?: boolean;
}

/**
 * Fetches the arborist authz mapping and the aggregate WTS (mesh) authz mapping
 * so that components can read them from the store via selectAuthzMappingData /
 * selectMeshAuthzMapping. Both mappings are refetched whenever the user logs in
 * or out. The fetch status is shared via useAuthzMappingsStatus so page
 * layouts can show a loader in place of the page content (see AuthzMappingsGate)
 * while keeping the header and footer.
 *
 * A failed authz mapping blocks the app. A failed mesh mapping does not, since
 * non-mesh commons may not provide the aggregate WTS endpoint; mesh-aware
 * features check selectMeshAuthzMapping for errors themselves.
 */
const AuthzMappingsProvider = ({
  children,
  enableWTS = false,
}: PropsWithChildren<AuthzMappingProviderProps>): ReactElement => {
  const loginStatus = useCoreSelector((state: CoreState) =>
    selectUserAuthStatus(state),
  );

  const {
    isLoading: isAuthzLoading,
    isFetching: isAuthzFetching,
    isError: isAuthzError,
    refetch: refetchAuthz,
  } = useGetAuthzMappingsQuery();
  const {
    isLoading: isMeshAuthzLoading,
    isFetching: isMeshAuthzFetching,
    refetch: refetchMeshAuthz,
  } = useGetAggregateWTSResourceAuthzMappingQuery(undefined, {
    skip: !enableWTS,
  });

  // last settled login status; the status passes through 'pending' each time
  // user details are re-fetched, which is not a login state change
  const lastLoginStatus = useRef<LoginStatus | null>(null);

  useEffect(() => {
    if (!isSettledLoginStatus(loginStatus)) return;
    // the initial fetch already uses the current credentials
    if (
      lastLoginStatus.current !== null &&
      lastLoginStatus.current !== loginStatus
    ) {
      void refetchAuthz();
      if (enableWTS) void refetchMeshAuthz();
    }
    lastLoginStatus.current = loginStatus;
  }, [loginStatus, enableWTS, refetchAuthz, refetchMeshAuthz]);

  const isLoading = isAuthzLoading || isMeshAuthzLoading;
  const isFetching = isAuthzFetching || isMeshAuthzFetching;
  const value = useMemo(
    () => ({ isLoading, isFetching, isError: isAuthzError }),
    [isLoading, isFetching, isAuthzError],
  );

  return (
    <AuthzMappingsContext.Provider value={value}>
      {children}
    </AuthzMappingsContext.Provider>
  );
};

interface AuthzMappingsGateProps {
  suppressErrors?: boolean; //
}

/**
 * Renders a loader or error in place of children until the authz mappings
 * are first loaded. On later refetches (e.g. after a login change) children
 * stay mounted under a LoadingOverlay so page state is kept. The overlay is
 * positioned against the nearest positioned ancestor, which is the layout's
 * relative <main>. Set suppressErrors to render children on error instead of
 * the error card. Used for the main content area of the page layouts.
 */
export const AuthzMappingsGate = ({
  children,
  suppressErrors = true,
}: PropsWithChildren<AuthzMappingsGateProps>): ReactElement => {
  const { isLoading, isFetching, isError } = useAuthzMappingsStatus();

  if (isLoading) {
    return (
      <div className="flex grow justify-center items-center">
        <Loader type="dots" />
      </div>
    );
  }

  if (isError && !suppressErrors) {
    return (
      <div className="w-full m-20">
        <ErrorCard message="Error getting authorization mappings from commons." />
      </div>
    );
  }

  return (
    <React.Fragment>
      <LoadingOverlay
        visible={isFetching}
        overlayProps={{
          backgroundOpacity: 0,
        }}
      />
      {children}
    </React.Fragment>
  );
};

export default AuthzMappingsProvider;
