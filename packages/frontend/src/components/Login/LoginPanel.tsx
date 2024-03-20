import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { showNotification } from '@mantine/notifications';
import TexturedSidePanel from '../Layout/TexturedSidePanel';
import LoginProvidersPanel from './LoginProvidersPanel';
import CredentialsLogin from './CredentialsLogin';
import TextContent from '../Content/TextContent';
import { LoginConfig } from './types';
import { GEN3_DOMAIN } from '@gen3/core';
import { stripTrailingSlash } from '../../utils';  // stripTrailingSlash is not used in this file

const LoginPanel = (loginConfig: LoginConfig) => {
  const { image, topContent, bottomContent } = loginConfig;

  const router = useRouter();
  const {
    query: { redirect },
  } = router;

 const redirectURL = redirect;

  const handleLoginSelected = useCallback( async (url: string, redirect?: string) => {
     router
      .push(
          (redirect ? `${redirect}` : '/'),
      )
      .catch((e) => {
        showNotification({
          title: 'Login Error',
          message: `error logging in ${e.message}`,
        });
      });
  }, [router]);

  return (
    <div className="grid grid-cols-6 w-full">
      <TexturedSidePanel url={image} />
      <div className="col-span-4 mt-24 flex-col justify-center sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl w-full first:captialize first:font-bold">
        {topContent?.map((content, index) => (
          <TextContent {...content} key={index} />
        ))}


        <LoginProvidersPanel
          handleLoginSelected={handleLoginSelected}
          redirectURL={redirectURL as string | undefined}
        />

        { loginConfig?.showCredentialsLogin ? <CredentialsLogin
          handleLoginSelected={handleLoginSelected}
          redirectURL={redirectURL as string | undefined}
        /> : null }

        {bottomContent?.map((content, index) => (
          <TextContent {...content} key={index} />
        ))}
      </div>
      <TexturedSidePanel url={image} />

    </div>
  );
};

export default LoginPanel;
