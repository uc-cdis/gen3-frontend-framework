import { GetServerSideProps } from 'next';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { type DiscoveryProps } from '../../features/Discovery/Discovery';
import { type NavPageLayoutProps } from '../../features/Navigation';

export const DiscoveryPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  const discoveryProps: DiscoveryProps = await ContentSource.get(
    `config/${GEN3_COMMONS_NAME}/discovery.json`,
  );

  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      ...discoveryProps,
    },
  };
};
