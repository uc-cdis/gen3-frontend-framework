import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { type ExplorerPageProps  } from './types';
import { CohortBuilderConfiguration } from '../../features/CohortBuilder';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import type { NavPageLayoutProps } from '../../features/Navigation';

export const ExplorerPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async (_context) => {
  const cohortBuilderProps: CohortBuilderConfiguration = await ContentSource.get(
    `config/${GEN3_COMMONS_NAME}/explorer.json`,
  );
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      explorerConfig: cohortBuilderProps,
    },
  };
};
