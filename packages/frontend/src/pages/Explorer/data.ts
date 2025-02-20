import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { CohortBuilderConfiguration } from '../../features/CohortBuilder';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import type { NavPageLayoutProps } from '../../features/Navigation';

export const ExplorerPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async (_context) => {
  try {
    const cohortBuilderProps: CohortBuilderConfiguration =
      await ContentSource.get(`config/${GEN3_COMMONS_NAME}/explorer.json`);
    console.log('cohortBuilderProps', cohortBuilderProps);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        sharedFilters: cohortBuilderProps?.sharedFilters,
        tabsLayout: cohortBuilderProps?.tabsLayout ?? 'left',
        explorerConfig: cohortBuilderProps.explorerConfig,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        explorerConfig: undefined,
      },
    };
  }
};
