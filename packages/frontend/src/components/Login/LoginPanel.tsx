import React from 'react';
import { useRouter } from 'next/router';
import { showNotification } from '@mantine/notifications';
import TexturedSidePanel from '../Layout/TexturedSidePanel';
import LoginProvidersPanel from './LoginProvidersPanel';
import TextContent from '../Content/TextContent';
import { LoginConfig } from './types';
import { GEN3_DOMAIN } from '@gen3/core';

const LoginPanel = (loginConfig: LoginConfig) => {
  const { image, topContent, bottomContent } = loginConfig;

  const router = useRouter();
  const {
    query: { redirect },
  } = router;

  const handleLoginSelected = async (url: string, redirect?: string) => {
    router
      .push(
        url +
          (redirect ? `?redirect=${redirect}` : `?redirect=${GEN3_DOMAIN}`),
      )
      .catch((e) => {
        showNotification({
          title: 'Login Error',
          message: `error logging in ${e.message}`,
        });
      });
  };

  return (
    <div className="flex flex-row justify-between">
      <TexturedSidePanel url={image} />
      <div className="mt-24 justify-center sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-180">
        {topContent?.map((content, index) => (
          <TextContent {...content} key={index} />
        ))}

        <LoginProvidersPanel
          handleLoginSelected={handleLoginSelected}
          redirectURL={redirect as string | undefined}
        />

        {bottomContent?.map((content, index) => (
          <TextContent {...content} key={index} />
        ))}
      </div>
      <TexturedSidePanel />
    </div>
  );
};

export default LoginPanel;
