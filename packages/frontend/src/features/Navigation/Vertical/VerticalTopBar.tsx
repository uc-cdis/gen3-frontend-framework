import React from 'react';
import { NavigationProps } from '../types';
import NavigationBarButton from '../NavigationBarButton';
import NavigationLogo from '../NavigationLogo';
import { TopBarProps, TopIconButtonProps } from '../TopBar';
import LoginButton from '../../../components/Login/LoginButton';
import { BiLogInCircle as LoginIcon } from 'react-icons/bi';
import { extractClassName } from '../utils';
import ActionMenu from '../ActionMenu';

export interface VerticalTopBarProps
  extends Pick<NavigationProps, 'logo' | 'classNames'> {
  readonly actions: TopBarProps;
}

const VerticalTopBar: React.FC<VerticalTopBarProps> = ({
  actions,
  logo = undefined,
  classNames = {},
}: VerticalTopBarProps) => {
  const classNamesDefaults = {
    root: 'my-2 border-b-1 border-base-lighter',
    login:
      'pl-1 mr-6 bg-base-max text-base-contrast opacity-80 hover:opacity-100',
  };

  const mergedClassnames = { ...classNamesDefaults, ...classNames };

  return (
    <div
      className={`flex justify-between ${extractClassName(
        'root',
        mergedClassnames,
      )}`}
    >
      <div
        className={`flex justify-center items-center align-middle ${extractClassName(
          'logo',
          mergedClassnames,
        )}`}
      >
        {logo && <NavigationLogo {...{ ...logo }} />}
      </div>

      <div className="flex items-center align-middle mr-3">
        {actions.showLogin ? (
          <LoginButton
            icon={<LoginIcon size={'3.15rem'} />}
            hideText
            className={`${extractClassName('login', mergedClassnames)}`}
          />
        ) : null}
        <ActionMenu items={actions.items} />
      </div>
    </div>
  );
};

export default VerticalTopBar;
