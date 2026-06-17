import React, { ReactNode, useEffect, useState } from 'react';

import { useSession } from '../../lib/session/session';
import { Center, Overlay, Stack, Text } from '@mantine/core';
import type { JWTSessionStatus } from '@gen3/core';

interface ProtectedComponentProps {
  children?: ReactNode;
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
const ProtectedComponentOverlay = ({ children }: ProtectedComponentProps) => {
  const [stableStatus, setStableStatus] = useState<
    JWTSessionStatus | undefined
  >();

  // Require auth; when unauthenticated, we trigger delayed redirect
  const { status, pending } = useSession(true);

  useEffect(() => {
    if (!pending && stableStatus !== status) {
      // only update stableStatus if session is not pending
      // this prevents flickering of the status
      setStableStatus(status);
    }
  }, [status, pending, stableStatus]);

  // While we don't have a stable "issued" status, we only handle login gating
  if (stableStatus !== 'issued') {
    // Not pending and not issued → unauthenticated (redirect will be triggered)
    return (
      <Overlay>
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
            </Stack>
          </Center>
        </div>
      </Overlay>
    );
  }
  return null;
};

export default ProtectedComponentOverlay;
