import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import { WorkspaceConfiguration } from '../../features/Workspace';
import { WorkspacePageProps } from './types';

export const WorkspacesPageGetServerSideProps: GetServerSideProps<
  WorkspacePageProps
> = async (_context) => {
  const workspaceProps: WorkspaceConfiguration = await ContentSource.get(
    `config/${GEN3_COMMONS_NAME}/workspace.json`,
  );

  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      workspaceProps,
    },
  };
};
