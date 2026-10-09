import type { JSX } from 'react';
import React from 'react';
import type { WorkspacePageLayoutProps } from './types';
import { NavPageLayout } from '../../features/Navigation';
import WorkspaceRequestAccess from '../../features/Workspace/WorkspaceRequestAccess';
import { Center } from '@mantine/core';
import ErrorCard from '../../components/MessageCards/ErrorCard';

const WorkspaceRequestAccessPage = ({
  headerProps,
  footerProps,
  headerMetadata,
  workspaceProps,
}: WorkspacePageLayoutProps): JSX.Element => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Workspace Request Access Page',
        content: 'Workspace Request Access page',
        key: 'gen3-workspace-request-access-page',
        ...(headerMetadata ? headerMetadata : {}),
        ...(workspaceProps?.headerMetadata
          ? workspaceProps.headerMetadata
          : {}),
      }}
    >
      {workspaceProps?.requestAccessForm?.enabled ? (
        <WorkspaceRequestAccess
          requestAccessForm={workspaceProps?.requestAccessForm}
        />
      ) : (
        <div className="flex flex-col w-full ml-2">
          <Center>
            <ErrorCard message="Workspace Request Access Form is not enabled" />
          </Center>
        </div>
      )}
    </NavPageLayout>
  );
};

export default WorkspaceRequestAccessPage;
