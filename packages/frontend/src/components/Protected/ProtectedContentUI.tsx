import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from '../../lib/session/session';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { type JWTSessionStatus } from '@gen3/core';

interface ProtectedContentProps {
  children?: ReactNode;
  referer?: string;
}

/**
 * This component is ONLY responsible for:
 *  - Showing a loader while the session is being resolved.
 *  - Showing a friendly "not logged in" message.
 *  - Redirecting to /Login with a referer when unauthenticated.
 *
 * It does NOT:
 *  - Fetch Arborist resources.
 *  - Enforce per-route authz or read routeConfig.
 * Those are enforced by the middleware before the page is rendered.
 */
const ProtectedContentUI = ({ children, referer }: ProtectedContentProps) => {
  const router = useRouter();
  const [stableStatus, setStableStatus] = useState<
    JWTSessionStatus | undefined
  >();

  let redirect = referer;
  if (!referer && typeof window !== 'undefined') {
    // route not available on SSR
    redirect = router.asPath;
  }

  const onUnauthenticated = () => {
    if (typeof window !== 'undefined') {
      void router.push({
        pathname: '/Login',
        query: { referer: redirect },
      });
    }
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
    if (pending) {
      // Session is being established/checked
      return (
        <div className="flex justify-center w-full mt-10">
          <Loader />
        </div>
      );
    }

    // Not pending and not issued → unauthenticated (redirect will be triggered)
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

  // At this point, the user is logged in and the middleware has already
  // allowed this request (including any authz checks). Just render children.
  return <React.Fragment>{children}</React.Fragment>;
};

export default ProtectedContentUI;
