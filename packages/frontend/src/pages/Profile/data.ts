import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import { type NavPageLayoutProps } from '../../features/Navigation';
import { QueryProps } from '../Query/types';
import ContentSource from '../../lib/content';
import { GEN3_COMMONS_NAME } from '@gen3/core';

export const ProfilePageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {

  const profileConfig: QueryProps = await ContentSource.get(
    `config/${GEN3_COMMONS_NAME}/profile.json`,
  );

  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      ...profileConfig
    },
  };
};
