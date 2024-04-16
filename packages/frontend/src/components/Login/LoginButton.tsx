import React, { useContext } from 'react';
import { UnstyledButton, Tooltip } from '@mantine/core';
import { NextRouter, useRouter } from 'next/router';
import { usePathname } from 'next/navigation';
import { MdLogin as LoginIcon } from 'react-icons/md';
import { SessionContext } from '../../lib/session/session';
import { type CoreState, selectUserAuthStatus, useCoreSelector, isAuthenticated } from '@gen3/core';


const handleSelected = async (
  isAuthenticated: boolean,
  router: NextRouter,
  referrer: string,
  endSession?: ()  => void,

) => {
  if (!isAuthenticated) await router.push(`Login?redirect=${referrer}`);
  else {
    endSession && endSession();
    await router.push(referrer);
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

  const { endSession } = useContext(SessionContext) ?? { endSession: undefined };

  const userStatus =  useCoreSelector((state: CoreState) => selectUserAuthStatus(state));
  const authenticated = isAuthenticated(userStatus);
  return (
    <Tooltip label={tooltip} position="bottom" withArrow
             multiline
             color="base"
             disabled={tooltip === undefined}
             classNames={TooltipStyle}>
    <UnstyledButton
      onClick={() =>
        handleSelected(authenticated, router, pathname, endSession)
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
