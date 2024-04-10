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
    <UnstyledButton className="mx-2" onClick={() => handleSelected()}>
      <div className="flex flex-nowrap items-center align-middle border-b-2 hover:border-accent border-transparent">
        {user?.name}
      </div>
    </UnstyledButton>
  ) : null;
};

export default LoginAccountButton;
