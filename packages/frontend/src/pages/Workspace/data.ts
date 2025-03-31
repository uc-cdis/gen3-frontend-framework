import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import { WorkspaceConfig } from '../../features/Workspace';
import { WorkspacePageLayoutProps } from './types';
import { type NavPageLayoutProps } from '../../features/Navigation';
import { LaunchStepIndicatorConfiguration } from '../../features/Workspace/types';

export const WorkspacePageGetServerSideProps: GetServerSideProps<
  WorkspacePageLayoutProps
> = async (_context) => {
  const workspaceProps: WorkspaceConfig =
    await ContentSource.getContentDatabase().get(
      `${GEN3_COMMONS_NAME}/workspace.json`,
    );
  try {
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        workspaceProps,
      },
    };
  } catch (err: unknown) {
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        workspaceProps: {
          launchStepIndicatorConfig: {} as LaunchStepIndicatorConfiguration,
        },
      },
    };
  }
};

export const WorkspaceNoAccessPageServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};
