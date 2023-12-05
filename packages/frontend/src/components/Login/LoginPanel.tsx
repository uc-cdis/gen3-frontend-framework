import React from 'react';
import { useRouter } from 'next/router';
import { showNotification } from '@mantine/notifications';
import TexturedSidePanel from '../Layout/TexturedSidePanel';
import LoginProvidersPanel from './LoginProvidersPanel';
import TextContent from '../Content/TextContent';
import { LoginConfig } from './types';
import { GEN3_DOMAIN } from '@gen3/core';

const stripTrailingSlash = (str:string):string => {
  return str.endsWith('/') ?
    str.slice(0, -1) :
    str;
};


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
          (redirect ? `?redirect=${redirect}` : `?redirect=${stripTrailingSlash(GEN3_DOMAIN)}/Profile`),
      )
      .catch((e) => {
        showNotification({
          title: 'Login Error',
          message: `error logging in ${e.message}`,
        });
      });
  };

  return (
    <div className="grid grid-cols-6">
      <TexturedSidePanel url={image} />
      <div className="col-span-4 mt-24 flex-col justify-center sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl w-full first:captialize first:font-bold">
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
      <TexturedSidePanel url={image} />

    </div>
  );
};

export default LoginPanel;
