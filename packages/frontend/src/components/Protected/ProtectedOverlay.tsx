import React, { useEffect, useState } from 'react';

import { useSession } from '../../lib/session/session';
import { Box, Overlay, Stack, Text } from '@mantine/core';
import type { JWTSessionStatus } from '@gen3/core';
import { IconLock } from '@tabler/icons-react';

interface ProtectedOverlayProps {
  /** Content to render underneath — always mounted, never visible when locked */
  children: React.ReactNode;
  /** Optional headline. Defaults to "Sign in to access this content" */
  title?: string;
  /** Optional supporting copy */
  description?: string;
  /** Blur strength in px applied to the content beneath. Defaults to 4 */
  blur?: number;
  /** Whether the overlay is disabled  */
  disabled?: boolean;
}

export function ProtectedOverlay({
  children,
  title = 'Sign in to access this content',
  description,
  blur = 4,
  disabled = false,
}: ProtectedOverlayProps) {
  const [stableStatus, setStableStatus] = useState<
    JWTSessionStatus | undefined
  >();

  // Require auth; when unauthenticated, we trigger delayed redirect
  const { status, pending } = useSession(true, () => {}); // do not re-direct to login

  useEffect(() => {
    if (!pending && stableStatus !== status) {
      // only update stableStatus if session is not pending
      // this prevents flickering of the status
      setStableStatus(status);
    }
  }, [status, pending, stableStatus]);
  const isLoggedIn = stableStatus === 'issued';

  if (disabled || isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <Box pos="relative">
      {/* The guarded content — always in the DOM so layout is preserved */}
      <Box style={{ pointerEvents: isLoggedIn ? 'auto' : 'none' }}>
        {children}
      </Box>

      {/* Overlay — only rendered when the user is not authenticated */}
      {!isLoggedIn && (
        <Overlay
          blur={blur}
          color="#000"
          backgroundOpacity={0.45}
          radius="sm"
          zIndex={10}
        >
          <Stack align="center" justify="center" h="100%" gap="sm" p="xl">
            <IconLock size={32} color="white" stroke={1.5} />

            <Text
              c="white"
              fw={600}
              fz="lg"
              ta="center"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,.5)' }}
            >
              {title}
            </Text>

            {description && (
              <Text
                c="rgba(255,255,255,.8)"
                fz="sm"
                ta="center"
                maw={320}
                style={{ textShadow: '0 1px 2px rgba(0,0,0,.4)' }}
              >
                {description}
              </Text>
            )}
          </Stack>
        </Overlay>
      )}
    </Box>
  );
}

export default ProtectedOverlay;
