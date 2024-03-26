import { GetServerSideProps } from 'next';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { type DiscoveryProps } from '../../features/Discovery/Discovery';
import type { NavPageLayoutProps } from '../../features/Navigation';

export const DiscoveryPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {

  try {
    const discoveryConfig: DiscoveryProps = await ContentSource.get(
      `config/${GEN3_COMMONS_NAME}/discovery.json`,
    );
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        discoveryConfig: discoveryConfig,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        discoveryConfig: undefined,
      },
    };
  }
};
