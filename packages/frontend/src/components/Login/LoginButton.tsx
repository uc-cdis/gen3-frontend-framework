import React from 'react';
import { UnstyledButton } from '@mantine/core';
import { useRouter } from 'next/router';
import { MdLogin as LoginIcon } from 'react-icons/md';
import { GEN3_DOMAIN, useUserAuth, isAuthenticated } from '@gen3/core';

const LoginButton = () => {
  const router = useRouter();

  const handleSelected = async (isAuthenticated: boolean) => {
    if (!isAuthenticated) await router.push(`${GEN3_DOMAIN}/Login`);
    else await router.push(`${GEN3_DOMAIN}/user/logout?next=${GEN3_DOMAIN}/`);
  };

  const { loginStatus } = useUserAuth();

  // TODO add referring page to redirect to after login
  return (
    <UnstyledButton
      className="mx-2"
      onClick={() => handleSelected(isAuthenticated(loginStatus))}
    >
      <div className="flex items-center hover:border-b-1 bg-secondary-lighter border-secondary text-secondary-contrast-lighter font-medium font-heading ">
        {isAuthenticated(loginStatus) ? 'Logout' : 'Login'}
        <LoginIcon className="pl-1" size={'1.75rem'} />
      </div>
    </UnstyledButton>
  );
};

export default LoginButton;
