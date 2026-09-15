import type { JSX } from 'react';
import React from 'react';
import type { WorkspacePageLayoutProps } from './types';
import { NavPageLayout } from '../../features/Navigation';
import WorkspaceRequestAccess from '../../features/Workspace/WorkspaceRequestAccess';
import { Title } from '@mantine/core';

const WorkspaceRequestAccessPage = ({
  headerProps,
  footerProps,
  workspaceProps,
}: WorkspacePageLayoutProps): JSX.Element => {

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Workspace Request Access Page',
        content: 'Workspace Request Access page',
        key: 'gen3-workspace-request-access-page',
        ...(workspaceProps?.headerMetadata
          ? workspaceProps.headerMetadata
          : {}),
      }}
    > 
      {workspaceProps?.requestAccessForm?.enabled ? (
        <WorkspaceRequestAccess requestAccessForm={workspaceProps?.requestAccessForm}/>
      ):(
        <Title
          size="h2"
          className="text-error"
        >
          Workspace Request Access Form is not setup
        </Title>
      )}
      
    </NavPageLayout>
  );
};

export default WorkspaceRequestAccessPage;
