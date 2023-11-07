import React from 'react';
import { NavPageLayout, NavPageLayoutProps } from '../../features/Navigation';
import { Profile } from '../../features/Profile';
import { ProfileConfig } from '../../components/Profile';

interface Props extends NavPageLayoutProps {
  profileConfig: ProfileConfig;
}

const ProfilePage = ({ headerProps, footerProps, profileConfig }: Props) => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <Profile profileConfig={profileConfig}/>
    </NavPageLayout>
  );
};

export default ProfilePage;
