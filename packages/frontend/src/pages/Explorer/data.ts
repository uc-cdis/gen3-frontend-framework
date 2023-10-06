import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { type ExplorerPageProps  } from './types';
import { CohortBuilderConfiguration } from "../../features/CohortBuilder";

export const ExplorerPageGetServerSideProps: GetServerSideProps<
  ExplorerPageProps
> = async (_context) => {
  const config = await ContentSource.get('config/siteConfig.json');
  const cohortBuilderProps: CohortBuilderConfiguration = await ContentSource.get(
    `config/${config.commons}/explorer.json`,
  );

  console.log("cohortBuilderProps", cohortBuilderProps);
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      ...cohortBuilderProps,
      ...config,
    },
  };
};
