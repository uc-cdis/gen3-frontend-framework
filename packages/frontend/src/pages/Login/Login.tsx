import { NavPageLayout, NavPageLayoutProps } from '../../features/Navigation';
import LoginPanel from '../../components/Login/LoginPanel';
import  { type LoginConfig } from '../../components/Login';
import React from 'react';

interface Props extends NavPageLayoutProps {
  loginConfig: LoginConfig;
}

const LoginPage = ({ headerProps, footerProps, loginConfig }: Props) => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <LoginPanel {...loginConfig} />
    </NavPageLayout>
  );
};

export default LoginPage;
