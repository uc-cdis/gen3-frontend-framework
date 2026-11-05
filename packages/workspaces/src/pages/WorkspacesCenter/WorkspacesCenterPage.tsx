import { WorkspacesPageLayoutProps } from './types';
import React, { JSX } from 'react';
import { FixedNavPageLayout } from '@gen3/frontend';
import WorkspaceCenter from '../../workspace/WorkspaceCenter';

import { selectWorkspaceFullscreen, useCoreSelector } from '@gen3/core';

const WorkspacesCenterPage = ({
  headerProps,
  footerProps,
  configuration,
}: WorkspacesPageLayoutProps): JSX.Element => {
  const isFullScreen = useCoreSelector((state) =>
    selectWorkspaceFullscreen(state),
  );

  return (
    <FixedNavPageLayout
      headerProps={headerProps}
      footerProps={{ ...footerProps, hideFooter: isFullScreen }}
      headerMetadata={{
        title: 'Gen3 Workspace Page',
        content: 'Workspace page',
        key: 'gen3-workspace-page',
        ...(configuration?.headerMetadata ? configuration.headerMetadata : {}),
      }}
    >
      <WorkspaceCenter {...configuration} />
    </FixedNavPageLayout>
  );
};

export default WorkspacesCenterPage;
