import React, { ReactElement } from 'react';

import { NavigationProps } from '../types';
import NavigationBarButton from '../NavigationBarButton';
import NavigationLogo from '../NavigationLogo';
import { TopBarProps } from '../TopBar';
import LoginButton from '../../../components/Login/LoginButton';
import { BiLogInCircle as LoginIcon } from 'react-icons/bi';
import { extractClassName } from '../utils';
import ActionMenu from '../ActionMenu';
import { defaultComposer } from 'default-composer';

export interface HorizontalNavigationBarProps extends NavigationProps {
  readonly actions: TopBarProps;
  loginIcon?: ReactElement;
}

const HorizontalNavigationBar = ({
  actions,
  items,
  logo = undefined,
  loginIcon = (<LoginIcon size={'3.15rem'} />),
  classNames = {},
}: HorizontalNavigationBarProps) => {
  const classNamesDefaults = {
    root: 'py-3 border-b-1 border-base-light shadow-sm',
    navigationPanel: 'font-heading font-bold tracking-wide text-xl space-x-4',
    login:
      'pl-1 mr-6 bg-base-max text-base-contrast opacity-80 hover:opacity-100',
  };

  const mergedClassnames = defaultComposer(classNamesDefaults, classNames);;

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
      <div
        className={`flex justify-center items-center align-middle ${extractClassName(
          'navigationPanel',
          mergedClassnames,
        )}`}
      >
        {items?.map((x, index) => {
          return (
            <div key={`${x.name}-${index}`}>
              <NavigationBarButton
                tooltip={x.tooltip}
                icon={x.icon}
                href={x.href}
                name={x.name}
                classNames={x.classNames}
              />
            </div>
          );
        })}
      </div>
      <div />
      <div className="flex items-center align-middle mr-3">
        {actions.showLogin ? (
          <LoginButton
            icon={loginIcon}
            hideText
            className={`${extractClassName('login', mergedClassnames)}`}
          />
        ) : null}
        <ActionMenu items={actions.items} />
      </div>
    </div>
  );
};

export default HorizontalNavigationBar;
