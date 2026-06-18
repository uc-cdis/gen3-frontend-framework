import {
  WorkspacesCenterPageConfiguration,
  WorkspacesPageLayoutProps,
} from './types';
import React, { JSX } from 'react';
import { NavPageLayout } from '@gen3/frontend';
import WorkspaceCenter from '../../workspace/WorkspaceCenter';
import { WorkspaceCardConfig } from '../../components/types';
import { selectWorkspaceFullscreen, useCoreSelector } from '@gen3/core';

/**
 * Transforms a WorkspacesCenterConfiguration object into a Record mapping workspace names
 * to their corresponding WorkspaceCardConfig.
 *
 * @param {WorkspacesCenterConfiguration} configuration - The configuration object containing
 * a list of workspace configurations.
 * @returns {Record<string, WorkspaceCardConfig>} A record where each key is a workspace name,
 * and each value is the corresponding WorkspaceCardConfig.
 */
const processConfiguration = (
  configuration: WorkspacesCenterPageConfiguration,
) => {
  // convert configuration into a Record<string, WorkspaceCardConfig>
  return configuration.workspaces.reduce(
    (acc, workspace) => {
      acc[workspace.tier] = workspace;
      return acc;
    },
    {} as Record<string, WorkspaceCardConfig>,
  );
};

const WorkspacesCenterPage = ({
  headerProps,
  footerProps,
  configuration,
}: WorkspacesPageLayoutProps): JSX.Element => {
  const config = {
    ...configuration,
    workspaces: processConfiguration(configuration),
  };

  const isFullScreen = useCoreSelector((state) =>
    selectWorkspaceFullscreen(state),
  );

  return (
    <NavPageLayout
      headerProps={headerProps}
      footerProps={{ ...footerProps, hideFooter: isFullScreen }}
      headerMetadata={{
        title: 'Gen3 Workspace Page',
        content: 'Workspace page',
        key: 'gen3-workspace-page',
        ...(configuration?.headerMetadata ? configuration.headerMetadata : {}),
      }}
    >
      <WorkspaceCenter {...config} />
    </NavPageLayout>
  );
};

export default WorkspacesCenterPage;
