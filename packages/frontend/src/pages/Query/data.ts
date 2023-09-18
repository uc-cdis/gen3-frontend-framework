import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { type QueryProps } from './types';
import { type NavPageLayoutProps } from '../../features/Navigation';

export const QueryPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async (_context) => {
  const config = await ContentSource.get('config/siteConfig.json');
  const queryProps: QueryProps = await ContentSource.get(
    `config/${config.commons}/query.json`,
  );

  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      queryProps: queryProps,
      ...config,
    },
  };
};
