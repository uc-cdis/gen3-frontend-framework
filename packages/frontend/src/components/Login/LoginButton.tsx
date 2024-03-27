import React from 'react';
import { UnstyledButton } from '@mantine/core';
import { useRouter } from 'next/router';
import { MdLogin as LoginIcon } from 'react-icons/md';
import { GEN3_FENCE_API,GEN3_REDIRECT_URL } from '@gen3/core';
import { useIsAuthenticated } from '../../lib/session/session';

interface LoginButtonProps {
  readonly icon?: React.ReactElement;
  readonly hideText?: boolean;
  className?: string;
}

const LoginButton = ({
  icon = <LoginIcon className="pl-1" size={'1.75rem'} />,
  hideText = false,
  className = 'flex items-center font-medium font-heading'
                                                 } : LoginButtonProps) => {
  const router = useRouter();

  const handleSelected = async (isAuthenticated: boolean) => {
    if (!isAuthenticated) await router.push('Login');
    else await router.push(`${GEN3_FENCE_API}/user/logout?next=${GEN3_REDIRECT_URL}/`);
  };

  const {
    isAuthenticated,
  } = useIsAuthenticated();

  // TODO add referring page to redirect to after login
  return (
    <UnstyledButton
      onClick={() => handleSelected(isAuthenticated)}
    >
      <div className={`flex items-center font-medium font-heading ${className}`}>
        {!hideText ? isAuthenticated ? 'Logout' : 'Login' : null}
        {icon}
      </div>
    </UnstyledButton>
  );
};

export default LoginButton;
