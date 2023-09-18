import React from 'react';
import { GetStaticProps } from 'next';
import { NavPageLayout, NavPageLayoutProps } from '../features/Navigation';
import { getNavPageLayoutPropsFromConfig } from '../lib/common/staticProps';
import ContentSource from '../lib/content';
import LoginPanel, { LoginPanelProps } from '../features/Login/LoginPanel';

type LoginPageProps = NavPageLayoutProps & LoginPanelProps;

const LoginPage = ({
  headerProps,
  footerProps,
  topContent,
  bottomContent,
}: LoginPageProps) => {
  return (
    <div className="flex flex-col">
      <NavPageLayout {...{ headerProps, footerProps }}>
        <LoginPanel topContent={topContent} bottomContent={bottomContent} />
      </NavPageLayout>
    </div>
  );
};

export const getStaticProps: GetStaticProps<NavPageLayoutProps> = async () => {
  const config = await ContentSource.get('config/siteConfig.json');

  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      ...(await ContentSource.get(`config/${config.commons}/login.json`)),
    },
  };
};

export default LoginPage;
