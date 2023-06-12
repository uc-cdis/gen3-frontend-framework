import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '@/lib/common/staticProps';
import ContentSource from '@/lib/content';
import{ type DiscoveryProps } from '@/components/Discovery/Discovery';
import { type NavPageLayoutProps } from '@/components/Navigation';

export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async (context) => {
  const config = await ContentSource.get('config/siteConfig.json');
  const discoveryProps: DiscoveryProps = await ContentSource.get(
    `config/${config.commons}/discovery.json`,
  );

  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      ...discoveryProps,
    },
  };
};
