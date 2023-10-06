import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { type ExplorerPageProps  } from './types';

export const ExplorerPageGetServerSideProps: GetServerSideProps<
  ExplorerPageProps
> = async (_context) => {
  const config = await ContentSource.get('config/siteConfig.json');
  const cohortBuilderProps: ExplorerPageProps = await ContentSource.get(
    `config/${config.commons}/explorer.json`,
  );
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      ...cohortBuilderProps,
      ...config,
    },
  };
};
