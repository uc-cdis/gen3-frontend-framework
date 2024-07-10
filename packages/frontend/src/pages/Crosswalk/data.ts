import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { type CrosswalkConfig } from '../../features/Crosswalk';
import { type NavPageLayoutProps } from '../../features/Navigation';
import { GEN3_COMMONS_NAME } from '@gen3/core';

export const CrosswalkPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  const config: CrosswalkConfig = await ContentSource.get(
    `config/${GEN3_COMMONS_NAME}/crosswalk.json`,
  );

  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      config: config,
    },
  };
};
