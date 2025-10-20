import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from '../../lib/session/session';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { type JWTSessionStatus } from '@gen3/core';

interface ProtectedContentProps {
  children?: ReactNode;
  referer?: string;
}

const ProtectedContent = ({ children, referer }: ProtectedContentProps) => {
  const router = useRouter();

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
  const [stableStatus, setStableStatus] = useState<JWTSessionStatus | undefined>();

  const { status, pending } = useSession(true, delayRedirect);
  useEffect(() => {
    if (!pending && (stableStatus !== status)) {
      // only update stableStatus if session is not pending
      // this prevents flickering of the status
      setStableStatus(status);
    }
  }, [status, pending]);

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

  return <React.Fragment>{children}</React.Fragment>;
};

export default ProtectedContent;
