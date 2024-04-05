import React, { useContext } from 'react';
import { UnstyledButton, Tooltip } from '@mantine/core';
import { NextRouter, useRouter } from 'next/router';
import { usePathname } from 'next/navigation'
import { MdLogin as LoginIcon } from 'react-icons/md';
import {  useIsAuthenticated, useSession } from '../../lib/session/session';
import { SessionContext, logoutUser } from '../../lib/session/session';

const handleSelected = async (
  isAuthenticated: boolean,
  router: NextRouter,
  referrer: string,
  isCredentialsLogin = false,

) => {
  if (!isAuthenticated) await router.push(`Login?redirect=${referrer}`);
  else {
    if (isCredentialsLogin) await router.push('/api/auth/credentialsLogout');
    else {
      await logoutUser(router);
    }
  }
};

interface LoginButtonProps {
  readonly icon?: React.ReactElement | string;
  readonly hideText?: boolean;
  className?: string;
  tooltip?: string;
}


const LoginButton = ({
  icon = <LoginIcon className="pl-1" size={'1.55rem'} />,
  hideText = false,
  className = 'flex flex-nowrap items-center align-middle border-b-2 hover:border-accent border-transparent mx-2',
  tooltip
}: LoginButtonProps) => {
  const router = useRouter();

  const pathname = usePathname();

  const { isCredentialsLogin } = useContext(SessionContext) ?? {
    isCredentialsLogin: false,
  };

  const { isAuthenticated } = useIsAuthenticated();
  return (
    <Tooltip label={tooltip} position="bottom" withArrow
             multiline
             color="base"
             disabled={tooltip === undefined}
             classNames={TooltipStyle}>
    <UnstyledButton
      onClick={() =>
        handleSelected(isAuthenticated, router, pathname, isCredentialsLogin)
      }
    >
      <div
        className={`flex items-center font-medium font-heading ${className}`}
      >
        {!hideText ? (authenticated ? 'Logout' : 'Login') : null}
        {icon}
      </div>
    </UnstyledButton>
    </Tooltip>
  );
};

export default LoginButton;
