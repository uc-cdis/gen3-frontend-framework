import React, { useContext } from 'react';
import { UnstyledButton, Tooltip } from '@mantine/core';
import { NextRouter, useRouter } from 'next/router';
import { usePathname } from 'next/navigation';
import { MdLogin as LoginIcon } from 'react-icons/md';
import { SessionContext } from '../../lib/session/session';
import {
  type CoreState,
  selectUserAuthStatus,
  useCoreSelector,
  isAuthenticated,
} from '@gen3/core';
import { TooltipStyle } from '../../features/Navigation/style';
import { LoginButtonVisibility } from './types';
import { mergeTailwindClassnameWithDefault } from '../../utils/mergeDefaultTailwindClassnames';

const handleSelected = async (
  isAuthenticated: boolean,
  router: NextRouter,
  referrer: string,
  endSession?: () => void,
  externalLoginUrl?: string,
) => {
  if (!isAuthenticated) await router.push(externalLoginUrl || `Login?redirect=${referrer}`);
  else {
    if (endSession) endSession();
  }
};

interface LoginButtonProps {
  readonly icon?: React.ReactElement | string;
  readonly hideText?: boolean;
  className?: string;
  tooltip?: string;
  visibility: LoginButtonVisibility;
  externalLoginUrl?: string;
}

const LoginButton = ({
  icon = <LoginIcon className="pl-1" size={'1.55rem'} />,
  hideText = false,
  className = undefined,
  tooltip,
  visibility,
  externalLoginUrl,
}: LoginButtonProps) => {
  const router = useRouter();

  const pathname = usePathname();

  const { endSession } = useContext(SessionContext) ?? {
    endSession: undefined,
  };

  const userStatus = useCoreSelector((state: CoreState) =>
    selectUserAuthStatus(state),
  );
  const authenticated = isAuthenticated(userStatus);

  if (visibility === LoginButtonVisibility.LogoutOnly && !authenticated)
    return null;

  const mergedClassname = mergeTailwindClassnameWithDefault(
    className,
    'flex flex-nowrap items-center font-content text-secondary-contrast-lighter align-middle border-b-2 hover:border-accent border-transparent mx-2',
  );

  return (
    <Tooltip
      label={tooltip}
      position="bottom"
      withArrow
      multiline
      color="base"
      disabled={tooltip === undefined}
      classNames={TooltipStyle}
    >
      <UnstyledButton
        onClick={() =>
          handleSelected(authenticated, router, pathname, endSession, externalLoginUrl)
        }
      >
        <div className={mergedClassname}>
          {!hideText ? (authenticated ? 'Logout' : 'Login') : null}
          {icon}
        </div>
      </UnstyledButton>
    </Tooltip>
  );
};

export default LoginButton;
