import { GetServerSideProps } from 'next';
import { NavPageLayoutProps } from '../../features/Navigation';
import ContentSource from '../../lib/content';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import { LoginConfig } from '../../components/Login';
import { GEN3_COMMONS_NAME } from '@gen3/core';

export const LoginPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  const loginConfig: LoginConfig = await ContentSource.get(
    `config/${GEN3_COMMONS_NAME}/login.json`,
  );

  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      ...{ loginConfig : loginConfig },
    },
  };
};
