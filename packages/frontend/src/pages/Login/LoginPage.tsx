import { NavPageLayout } from '../../features/Navigation';
import LoginPanel from '../../components/Login/LoginPanel';
import React from 'react';
import { LoginPageLayoutProps } from './types';

const LoginPage = ({
  headerProps,
  footerProps,
  headerMetadata,
  loginConfig,
}: LoginPageLayoutProps) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Login Page',
        content: 'Login page',
        key: 'gen3-login-page',
        ...(headerMetadata ? headerMetadata : {}),
        ...(loginConfig.headerMetadata ? loginConfig.headerMetadata : {}),
      }}
    >
      <LoginPanel {...loginConfig} />
    </NavPageLayout>
  );
};

export default LoginPage;
