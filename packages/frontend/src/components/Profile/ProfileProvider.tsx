import React, { createContext } from 'react';
import { ProfileConfig } from './types';

interface ProfileProviderValue {
  profileConfig: ProfileConfig;
}

const ProfileContext = createContext<ProfileProviderValue>({
  profileConfig: {} as ProfileConfig,
});

const useProfileContext = () => {
  const context = React.useContext(ProfileContext);
  if (context === undefined) {
    throw Error(
      'Profile must be used  must be used inside of a ProfileContext',
    );
  }
  return context;
};

const ProfileProvider = ({
  children,
  profileConfig,
}: {
  children: React.ReactNode;
  profileConfig: ProfileConfig;
}) => {
  return (
    <ProfileContext.Provider value={{ profileConfig }}>
      {children}
    </ProfileContext.Provider>
  );
};

export { useProfileContext, ProfileProvider as default };
