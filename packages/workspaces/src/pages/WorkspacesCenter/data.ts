import { GetServerSideProps } from 'next';
import { merge } from 'lodash';
import { ContentSource, getNavPageLayoutPropsFromConfig } from '@gen3/frontend';
import {
  WorkspacesCenterPageConfiguration,
  WorkspacesPageLayoutProps,
} from './types';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import { WorkspaceTier } from '../../types';
import {
  FreeWorkspaceTierConfiguration,
  RemoteComputeWorkspaceTierConfiguration,
} from '../../workspace/tiers/types';

const DEFAULT_WORKSPACES_CONFIGURATION: WorkspacesCenterPageConfiguration = {
  workspaces: {},
  tierConfiguration: {
    free: {
      baseUrl:
        process.env.FREE_WORKSPACE_ASSETS_BASE_URL ??
        '/api/workspace-assets/free',
      toolbar: {
        label: 'JupyterLite',
        description: 'Running via JupyterLite',
        showStop: false,
        showStatus: false,
      },
      settings: {
        showKernels: false,
      },
      dataAndTools: {
        enabled: true,
        tabs: [
          {
            label: 'Dictionary',
            description: 'Data Dictionary',
            app: 'dictionary',
          },
        ],
        width: 300,
      },
    },
    remote: {
      baseUrl:
        process.env.REMOTE_COMPUTE_WORKSPACE_ASSETS_BASE_URL ??
        '/api/workspace-assets/remote',
      toolbar: {
        label: 'Remote Compute Environment',
        description: 'Running with Remote Kernels',
        showStop: true,
        showStatus: true,
      },
      settings: {
        showKernels: true,
      },
      dataAndTools: {
        enabled: true,
        tabs: [
          {
            label: 'Dictionary',
            description: 'Data Dictionary',
            app: 'dictionary',
          },
        ],
      },
    },
  } as Record<
    WorkspaceTier,
    FreeWorkspaceTierConfiguration | RemoteComputeWorkspaceTierConfiguration
  >,
};

export const WorkspacesCenterPageGetServerSideProps: GetServerSideProps<
  WorkspacesPageLayoutProps
> = async () => {
  try {
    const workspacesCenterConfiguration: WorkspacesCenterPageConfiguration =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/workspaces.json`,
      );

    const mergedConfiguration = merge(
      {},
      DEFAULT_WORKSPACES_CONFIGURATION,
      workspacesCenterConfiguration,
    );

    console.log('mergedConfiguration', mergedConfiguration);

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configuration: mergedConfiguration,
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
