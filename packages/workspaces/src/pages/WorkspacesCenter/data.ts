import { GetServerSideProps } from 'next';
import { ContentSource, getNavPageLayoutPropsFromConfig } from '@gen3/frontend';
import {
  WorkspacesCenterConfiguration,
  WorkspacesPageLayoutProps,
} from './types';
import { GEN3_COMMONS_NAME } from '@gen3/core';

const DEFAULT_WORKSPACES_CONFIGURATION: WorkspacesCenterConfiguration = {
  workspaces: [],
};

export const WorkspacesCenterPageGetServerSideProps: GetServerSideProps<
  WorkspacesPageLayoutProps
> = async () => {
  try {
    const workspacesCenterConfiguration: WorkspacesCenterConfiguration =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/workspaces.json`,
      );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configuration: {
          ...workspacesCenterConfiguration,
          workspaces: processConfiguration(workspacesCenterConfiguration),
        },
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.warn('Error fetching query configuration:', error.message);
      console.warn('Returning default configuration');
    }
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configuration: DEFAULT_WORKSPACES_CONFIGURATION,
      },
    };
  }
};

/**
 * Transforms a WorkspacesCenterConfiguration object into a Record mapping workspace names
 * to their corresponding WorkspaceCardConfig.
 *
 * @param {WorkspacesCenterConfiguration} configuration - The configuration object containing
 * a list of workspace configurations.
 * @returns {Record<string, WorkspaceCardConfig>} A record where each key is a workspace name,
 * and each value is the corresponding WorkspaceCardConfig.
 */
const processConfiguration = (configuration: WorkspacesCenterConfiguration) => {
  // convert configuration into a Record<string, WorkspaceCardConfig>
  return configuration.workspaces.reduce(
    (acc, workspace) => {
      acc[workspace.name] = workspace;
      return acc;
    },
    {} as Record<string, WorkspaceCardConfig>,
  );
};
