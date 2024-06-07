import React from 'react';
import { UnstyledButton } from '@mantine/core';
import { useRouter } from 'next/router';
import { selectUserAuthStatus, selectUserDetails,  useCoreSelector, isAuthenticated, type CoreState } from '@gen3/core';


const LoginAccountButton = () => {
  const router = useRouter();

  const handleSelected = async () => {
    await router.push('Profile');
  };

 const userStatus =  useCoreSelector((state: CoreState) => selectUserAuthStatus(state));
 const userInfo = useCoreSelector((state: CoreState) => selectUserDetails(state));

  return userStatus && isAuthenticated(userStatus) ? (
    <UnstyledButton className="mx-2" onClick={() => handleSelected()}>
      <div className="flex flex-nowrap items-center align-middle border-b-2 text-primary-max hover:border-primary-max border-transparent">
        {userInfo?.username}
      </div>
    </UnstyledButton>
  ) : null;
};

export default LoginAccountButton;
