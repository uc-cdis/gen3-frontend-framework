import React from 'react';
import {
  NavPageLayout,
  NavPageLayoutProps,
} from '../../../features/Navigation';

const RequestAccessForm = ({
  headerProps,
  footerProps,
}: NavPageLayoutProps) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Theme Page',
        content: 'Theme page',
        key: 'gen3-theme-page',
      }}
    >
      <div className="flex justify-items-center w-full">
        <h1>Study Registration Access Request</h1>
      </div>
    </NavPageLayout>
  );
};

export default RequestAccessForm;
