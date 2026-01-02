import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import Workspace from '../../features/Workspace/Workspace';
import { WorkspacePageLayoutProps } from './types';
import { useRouter } from 'next/router';
import { NextRouter } from 'next/dist/client/router';

const getWorkspaceId = (router: NextRouter): string | undefined => {
  const { workspace } = router.query;
  if (typeof workspace === 'string') return workspace;
  else if (typeof workspace === 'object') return workspace[0];

  return undefined;
};

const WorkspacePage = ({
  headerProps,
  footerProps,
  workspaceProps,
}: WorkspacePageLayoutProps): JSX.Element => {
  const router = useRouter();

  const id = getWorkspaceId(router);

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Workspace Page',
        content: 'Workspace page',
        key: 'gen3-workspace-page',
        ...(workspaceProps?.headerMetadata
          ? workspaceProps.headerMetadata
          : {}),
      }}
    >
      <Workspace config={workspaceProps} workspaceToRunId={id} />
    </NavPageLayout>
  );
};

export default WorkspacePage;
