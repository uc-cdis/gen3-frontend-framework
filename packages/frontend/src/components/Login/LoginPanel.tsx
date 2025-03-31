import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { showNotification } from '@mantine/notifications';
import { Center, Stack } from '@mantine/core';
import TexturedSidePanel from '../Layout/TexturedSidePanel';
import LoginProvidersPanel from './LoginProvidersPanel';
import CredentialsLogin from './CredentialsLogin';
import TextContent from '../Content/TextContent';
import { LoginConfig } from './types';
import { GEN3_REDIRECT_URL } from '@gen3/core';
import { isArray } from 'lodash';

const filterRedirect = (redirect: string | string[] | undefined) => {
  let redirectPath = '';
  if (Array.isArray(redirect)) {
    redirectPath = redirect[0];
  } else {
    redirectPath = redirect ?? '/';
  }
  return GEN3_REDIRECT_URL
    ? `${GEN3_REDIRECT_URL}/${redirectPath}`
    : redirectPath;
};

const LoginPanel = (loginConfig: LoginConfig) => {
  const { image, topContent, bottomContent } = loginConfig;

  const router = useRouter();
  const {
    query: { referer },
  } = router;

  const handleFenceLoginSelected = useCallback(
    async (loginURL: string) => {
      router
        .push(`${loginURL}?redirect=${filterRedirect(referer)}`)
        .catch((e) => {
          showNotification({
            title: 'Login Error',
            message: `error logging in ${e.message}`,
          });
        });
    },
    [referer, router],
  );

  const handleCredentialsLogin = useCallback(async () => {
    const redirect = !referer ? '/' : isArray(referer) ? referer[0] : referer;
    router.push(redirect).catch((e) => {
      showNotification({
        title: 'Login Error',
        message: `error logging in ${e.message}`,
      });
    });
  }, [referer, router]);

  return (
    <div className="grid grid-cols-6 w-full">
      <TexturedSidePanel url={image} />
      <div className="relative col-span-4 mt-24 flex-col justify-center sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl w-full first:captialize first:font-bold">
        {topContent?.map((content, index) => (
          <TextContent {...content} key={index} />
        ))}

        <LoginProvidersPanel handleLoginSelected={handleFenceLoginSelected} />

        {loginConfig?.showCredentialsLogin &&
          process.env.NODE_ENV === 'development' && (
            <CredentialsLogin handleLogin={handleCredentialsLogin} />
          )}
        <Center>
          <Stack>
            {bottomContent?.map((content, index) => (
              <TextContent {...content} key={`bottomContent-${index}`} />
            ))}
          </Stack>
        </Center>
      </div>
      <TexturedSidePanel url={image} />
    </div>
  );
};

export default LoginPanel;
