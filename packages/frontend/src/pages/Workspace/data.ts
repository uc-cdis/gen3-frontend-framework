import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import { WorkspaceConfig } from '../../features/Workspace';
import { WorkspacePageLayoutProps } from './types';

export const WorkspacePageGetServerSideProps: GetServerSideProps<
  WorkspacePageLayoutProps
> = async (_context) => {
  const workspaceProps: WorkspaceConfig = await ContentSource.get(
    `config/${GEN3_COMMONS_NAME}/workspace.json`,
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
        workspaceProps: {},
      },
    };
  }
};
