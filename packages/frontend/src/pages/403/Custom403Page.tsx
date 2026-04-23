import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import { Custom403PageProps } from './types';
import TextContent from '../../components/Content/TextContent';
import Image from 'next/image';
import { Button } from '@mantine/core';

const Custom403Page = ({
  headerProps,
  footerProps,
  config403,
}: Custom403PageProps) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: '403: Not Authorized',
        content: '403',
        key: 'gen3-not-authorized',
        ...(config403?.headerMetadata ? config403.headerMetadata : {}),
      }}
    >
      <div className="w-full max-w-[500px] m-auto text-center">
        {config403?.topIcon && (
          <div className="bg-white rounded-lg inline-block p-3">
            <Image src={config403.topIcon.src} alt={config403.topIcon.alt} width={36} height={36}/>
          </div>
        )}
        {config403?.content?.map((content, index) => (
          <TextContent {...content} key={index} />
        ))}
        {config403?.button && (
          <Button
            component="a"
            variant={config403.button.variant}
            href={config403.button.href}
            target="_blank"
            className="mt-3"
          >{config403.button.text}</Button>
        )}
      </div>
    </NavPageLayout>
  );
};

export default Custom403Page;
