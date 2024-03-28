import React, { useContext } from 'react';
import { UnstyledButton } from '@mantine/core';
import { NextRouter, useRouter } from 'next/router';
import { MdLogin as LoginIcon } from 'react-icons/md';
import { GEN3_FENCE_API, GEN3_REDIRECT_URL } from '@gen3/core';
import { useIsAuthenticated } from '../../lib/session/session';
import { SessionContext } from '../../lib/session/session';

const handleSelected = async (
  isAuthenticated: boolean,
  router: NextRouter,
  isCredentialsLogin = false,
) => {
  if (!isAuthenticated) await router.push('Login');
  else {
    if (isCredentialsLogin) await router.push('/api/auth/credentialsLogout');
    else
      await router.push(
        `${GEN3_FENCE_API}/user/logout?next=${GEN3_REDIRECT_URL}/`,
      );
  }
};

interface LoginButtonProps {
  readonly icon?: React.ReactElement;
  readonly hideText?: boolean;
  className?: string;
}

const LoginButton = ({
  icon = <LoginIcon className="pl-1" size={'1.75rem'} />,
  hideText = false,
  className = 'flex items-center font-medium font-heading',
}: LoginButtonProps) => {
  const router = useRouter();

  const { isCredentialsLogin } = useContext(SessionContext) ?? {
    isCredentialsLogin: false,
  };

  const { isAuthenticated } = useIsAuthenticated();

  // TODO add referring page to redirect to after login
  return (
    <UnstyledButton
      onClick={() =>
        handleSelected(isAuthenticated, router, isCredentialsLogin)
      }
    >
      <div
        className={`flex items-center font-medium font-heading ${className}`}
      >
        {!hideText ? (isAuthenticated ? 'Logout' : 'Login') : null}
        {icon}
      </div>
    </UnstyledButton>
  );
};

export default LoginButton;
