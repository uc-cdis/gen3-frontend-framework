import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useSession } from '../../lib/session/session';
import { Center, Loader, Paper, Text } from '@mantine/core';

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

  const { status, pending } = useSession(true, onUnauthenticated);
  if (status !== 'issued') {
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
            <Paper shadow="md" p="md">
              <Text>
                You are not signed in and cannot access this protected content.
                Please login in.
              </Text>
            </Paper>
          </Center>
        </div>
      );
  }

  return <React.Fragment>{children}</React.Fragment>;
};

export default ProtectedContent;
