import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import { Custom403PageProps } from './types';
import TextContent from '../../components/Content/TextContent';

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
      <div className="w-full max-w-[500px] m-auto">
        {config403?.content?.map((content, index) => (
          <TextContent {...content} key={index} />
        ))}
      </div>
    </NavPageLayout>
  );
};

export default Custom403Page;
