import React from 'react';
import { UnstyledButton } from '@mantine/core';
import { useRouter } from 'next/router';
import { useIsAuthenticated } from '../../lib/session/session';

const LoginAccountButton = () => {
  const router = useRouter();

  const handleSelected = async () => {
    await router.push('Profile');
  };

  const {
    isAuthenticated,
    user,
  } = useIsAuthenticated();

  return isAuthenticated ? (
    <UnstyledButton className="mx-2" onClick={async () => await handleSelected()}>
      <div className="flex items-center hover:border-b-1 border-primary-darker text-primary-contrast font-medium font-heading ">
        {user?.name}
      </div>
    </UnstyledButton>
  ) : null;
};

export default LoginAccountButton;
