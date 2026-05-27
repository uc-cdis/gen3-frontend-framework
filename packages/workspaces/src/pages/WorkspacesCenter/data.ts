import { GetServerSideProps } from 'next';
import { ContentSource, getNavPageLayoutPropsFromConfig } from '@gen3/frontend';
import {
  WorkspacesCenterPageConfiguration,
  WorkspacesPageLayoutProps,
} from './types';
import { GEN3_COMMONS_NAME } from '@gen3/core';

const DEFAULT_WORKSPACES_CONFIGURATION: WorkspacesCenterPageConfiguration = {
  workspaces: [],
};

export const WorkspacesCenterPageGetServerSideProps: GetServerSideProps<
  WorkspacesPageLayoutProps
> = async () => {
  try {
    const workspacesCenterConfiguration: WorkspacesCenterPageConfiguration =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/workspaces.json`,
      );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configuration: {
          ...workspacesCenterConfiguration,
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
