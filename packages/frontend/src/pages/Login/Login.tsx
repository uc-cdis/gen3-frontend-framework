import { useRouter } from 'next/router';
import { NavPageLayout } from '../../features/Navigation';
import LoginPanel from '../../components/Login/LoginPanel';
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
