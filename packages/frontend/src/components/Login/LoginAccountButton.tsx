import React from 'react';
import { UnstyledButton } from '@mantine/core';
import { useRouter } from 'next/router';
import {
  GEN3_DOMAIN,
  useCoreSelector,
  selectUserData,
  isAuthenticated,
} from '@gen3/core';

const LoginAccountButton = () => {
  const router = useRouter();

  const handleSelected = async () => {
    await router.push(`${GEN3_DOMAIN}/Profile`);
  };

  const { data: user, loginStatus } = useCoreSelector(selectUserData);

  return isAuthenticated(loginStatus) ? (
    <UnstyledButton className="mx-2" onClick={() => handleSelected()}>
      <div className="flex items-center hover:border-b-1 border-primary-darker text-primary-contrast font-medium font-heading ">
        {user?.username}
      </div>
    </UnstyledButton>
  ) : null;
};

export default LoginAccountButton;
