import { WorkspacesPageLayoutProps } from './types';
import { useRouter } from 'next/router';
import React, { JSX } from 'react';
import { NavPageLayout } from '@gen3/frontend';

const WorkspacesCenterPage = ({
  headerProps,
  footerProps,
  configuration,
}: WorkspacesPageLayoutProps): JSX.Element => {
  const router = useRouter();

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Workspace Page',
        content: 'Workspace page',
        key: 'gen3-workspace-page',
        ...(configuration?.headerMetadata ? configuration.headerMetadata : {}),
      }}
    ></NavPageLayout>
  );
};

export default WorkspacesCenterPage;
