import React, { useContext } from 'react';
import { NameAndIcon } from '../types';
import { mergeDefaultTailwindClassnames } from '../../../utils/mergeDefaultTailwindClassnames';
import { NextRouter, useRouter } from 'next/router';
import { usePathname } from 'next/navigation';
import { SessionContext } from '../../../lib/session/session';
import {
  type CoreState,
  isAuthenticated,
  selectUserAuthStatus,
  useCoreSelector,
} from '@gen3/core';
import { LoginButtonVisibility } from '../../../components/Login/types';
import { IconButton } from './IconButton';

const handleSelected = async (
  isAuthenticated: boolean,
  router: NextRouter,
  referrer: string,
  endSession?: () => void,
  externalLoginUrl?: string,
) => {
  if (!isAuthenticated)
    await router.push(externalLoginUrl || `/Login?redirect=${referrer}`);
  else {
    if (endSession) endSession();
  }
};

export interface TopBarLoginButtonProps extends NameAndIcon {
  readonly href: string;
  readonly tooltip?: string;
  visibility: LoginButtonVisibility;
  externalLoginUrl?: string;
}

export const LoginButton = ({
  name = 'login',
  leftIcon = undefined,
  rightIcon = undefined,
  tooltip = 'Login to your account',
  visibility,
  externalLoginUrl,
  iconSize = 'md',
  classNames = {},
}: Partial<TopBarLoginButtonProps>) => {
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

  return (
    <IconButton
      name={authenticated ? 'Logout' : 'Login'}
      leftIcon={leftIcon}
      rightIcon={authenticated ? 'gen3:logout' : 'gen3:login'}
      iconSize={iconSize}
      classNames={classNames}
      clickHandler={() =>
        handleSelected(
          authenticated,
          router,
          pathname,
          endSession,
          externalLoginUrl,
        )
      }
    />
  );
};
