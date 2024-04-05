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

  return isAuthenticated ? (
    <UnstyledButton className="mx-2" onClick={async () => await handleSelected()}>
      <div className="flex items-center hover:border-b-1 border-primary-darker text-primary-contrast font-medium font-heading ">
        {user?.name}
      </div>
    </UnstyledButton>
  ) : null;
};

export default LoginAccountButton;
