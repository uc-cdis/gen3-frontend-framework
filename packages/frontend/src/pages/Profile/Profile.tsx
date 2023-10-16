import React from 'react';
import { LandingPageProps } from '../../components/Content/LandingPageContent';
import { NavPageLayout, NavPageLayoutProps } from '../../features/Navigation';
import { Profile } from '../../features/Profile';

interface Props extends NavPageLayoutProps {
  landingPage: LandingPageProps;
}

const ProfilePage = ({ headerProps, footerProps }: Props) => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <Profile />
    </NavPageLayout>
  );
};

export default ProfilePage;
