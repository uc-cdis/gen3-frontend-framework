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

export const WorkspacesPageGetServerSideProps: GetServerSideProps<
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
        configuration: workspacesCenterConfiguration,
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
