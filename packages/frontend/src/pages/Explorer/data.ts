import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { type NavPageLayoutProps } from '../../features/Navigation';

export const ExplorerPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async (_context) => {
  const config = await ContentSource.get('config/siteConfig.json');

  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      ...config,
    },
  };
};
