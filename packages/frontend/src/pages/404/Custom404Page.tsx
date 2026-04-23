import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import { Custom404PageProps } from './types';
import TextContent from '../../components/Content/TextContent';
import Image from 'next/image';

const Custom404Page = ({
  headerProps,
  footerProps,
  config404,
}: Custom404PageProps) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: '404: Page Not Found',
        content: '404',
        key: 'gen3-page-not-found',
        ...(config404?.headerMetadata ? config404.headerMetadata : {}),
      }}
    >
      <div className="w-full max-w-[500px] m-auto text-center">
        {config404?.topIcon && (
          <div className="bg-white rounded-lg inline-block p-3">
            <Image src={config404.topIcon.src} alt={config404.topIcon.alt} width={36} height={36}/>
          </div>
        )}
        {config404?.content?.map((content, index) => (
          <TextContent {...content} key={index} />
        ))}
      </div>
    </NavPageLayout>
  );
};

export default Custom404Page;
