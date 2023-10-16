import { NavPageLayout, NavPageLayoutProps } from '../../features/Navigation';
import LoginPanel from '../../components/Login/LoginPanel';
import { type LoginConfig } from '../../components/Login';
import React from 'react';
import { LoginPageLayoutProps } from './types';


const LoginPage = ({ headerProps, footerProps, loginConfig }: LoginPageLayoutProps) => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <LoginPanel {...loginConfig} />
    </NavPageLayout>
  );
};

export default LoginPage;
