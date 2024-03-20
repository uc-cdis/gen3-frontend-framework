import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
// import ContentSource from '../../lib/content';
import { type WorkspaceProps } from './types';
import { type NavPageLayoutProps } from '../../features/Navigation';
// import { GEN3_COMMONS_NAME } from '@gen3/core';

export const WorkspacePageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async (_context) => {
//   const queryProps: WorkspaceProps = await ContentSource.get(
//     `config/${GEN3_COMMONS_NAME}/query.json`,
//   );

  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      queryProps: "",
    },
  };
};
