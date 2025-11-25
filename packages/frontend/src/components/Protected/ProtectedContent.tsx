import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from '../../lib/session/session';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { type JWTSessionStatus } from '@gen3/core';
import useSWR from 'swr';

interface ProtectedContentProps {
  children?: ReactNode;
  referer?: string;
}

type RouteRule = {
  loginRequired?: boolean;
  authzResources?: string[];
};

type RouteConfig = Record<string, RouteRule>;

interface ArboristApiResponse {
  disabled: boolean; // true if ARBORIST_AUTHZ_ENABLED is false on the server
  resources: string[]; // user resources from /auth/resources
  routeConfig: RouteConfig; // same config the middleware uses
}

const fetcher = async (url: string): Promise<ArboristApiResponse> => {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    throw new Error(`Failed to fetch Arborist resources: ${res.status}`);
  }
  return res.json();
};

const ProtectedContent = ({ children, referer }: ProtectedContentProps) => {
  const router = useRouter();
  const [stableStatus, setStableStatus] = useState<JWTSessionStatus | undefined>();

  const shouldFetchArborist = stableStatus === 'issued';
  const { data, error, isLoading } = useSWR<ArboristApiResponse>(
    shouldFetchArborist ? '/api/auth/resources' : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 60_000,
      shouldRetryOnError: false,

    },
  );

  let redirect = referer;
  if (!referer && typeof window !== 'undefined') {
    // route not available on SSR
    redirect = router.asPath;
  }

  const onUnauthenticated = () => {
    if (typeof window !== 'undefined')
      // route not available on SSR
      router.push({
        pathname: '/Login',
        query: { referer: redirect },
      });
  };

  const delayRedirect = () => {
    setTimeout(() => {
      onUnauthenticated();
    }, 2000);
  };



  // Require auth; when unauthenticated, we trigger delayed redirect
  const { status, pending } = useSession(true, delayRedirect);

  useEffect(() => {
    if (!pending && stableStatus !== status) {
      // only update stableStatus if session is not pending
      // this prevents flickering of the status
      setStableStatus(status);
    }
  }, [status, pending, stableStatus]);

  // While we don't have a stable "issued" status, we only handle login gating
  if (stableStatus !== 'issued') {
    // not logged in
    if (pending)
      return (
        <div className="flex justify-center w-full mt-10">
          <Loader />
        </div>
      );
    else
      return (
        <div className="w-full h-full relative">
          <Center>
            <Stack
              h={300}
              align="center"
              justify="center"
              gap="md"
              className="mt-24"
            >
              <Text>
                You are not logged in and cannot access this protected content.
              </Text>
              <Text>
                You will be redirected to the login page in a few seconds..
              </Text>
            </Stack>
          </Center>
        </div>
      );
  }

  /**
   * At this point, the user is logged in (stableStatus === 'issued').
   * Now we optionally enforce Arborist authz based on config.
   *
   * The API /api/arborist/resources:
   *  - Applies ARBORIST_AUTHZ_ENABLED flag
   *  - Returns user resources + routeConfig
   */


  // If we’re not fetching (e.g. shouldFetchArborist === false), just render children
  if (!shouldFetchArborist) {
    return <>{children}</>;
  }

  // While we are checking Arborist / config, show a loader
  if (isLoading || (!data && !error)) {
    return (
      <div className="flex justify-center w-full mt-10">
        <Loader />
      </div>
    );
  }

  // If the API call itself failed, be conservative and show an error message
  if (error) {
    return (
      <div className="w-full h-full relative">
        <Center>
          <Stack
            h={300}
            align="center"
            justify="center"
            gap="md"
            className="mt-24"
          >
            <Text>
              There was a problem checking your access permissions. Please try
              again or contact support if this continues.
            </Text>
          </Stack>
        </Center>
      </div>
    );
  }

  const pathname = router.pathname;
  const rule: RouteRule | undefined = data?.routeConfig?.[pathname];

  // If this route is not configured in the Arborist page config,
  // treat it as login-only (middleware already handled security).
  if (!rule) {
    return <>{children}</>;
  }

  const hasAuthzResources =
    Array.isArray(rule.authzResources) && rule.authzResources.length > 0;

  // If authz is globally disabled, or this route has no authzResources,
  // then login-only is sufficient.
  if (data?.disabled || !hasAuthzResources) {
    return <>{children}</>;
  }

  // Authz is enabled AND route has authzResources:
  // The user must have at least one of those resources.
  const userResources = data?.resources || [];
  const allowed = rule.authzResources!.some((needed) =>
    userResources.includes(needed),
  );

  if (!allowed) {
    return (
      <div className="w-full h-full relative">
        <Center>
          <Stack
            h={300}
            align="center"
            justify="center"
            gap="md"
            className="mt-24"
          >
            <Text>
              You are signed in but do not have permission to view this content.
            </Text>
          </Stack>
        </Center>
      </div>
    );
  }

  return <React.Fragment>{children}</React.Fragment>;
};

export default ProtectedContent;
