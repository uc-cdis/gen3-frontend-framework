import React from 'react';
import { Icon } from '@iconify/react';
import LoginButton from '../../components/Login/LoginButton';
import LoginAccountButton from '../../components/Login/LoginAccountButton';
import { extractClassName } from './utils';

export interface NameAndIcon {
  readonly name: string;
  readonly rightIcon?: string;
  readonly leftIcon?: string;
  readonly classNames: Record<string, string>;
}

export interface TopIconButtonProps extends NameAndIcon {
  readonly href: string;
}

const TopIconButton = ({
  name,
  leftIcon = undefined,
  rightIcon = undefined,
  classNames = {},
}: NameAndIcon) => {
  const classNamesDefaults = {
    root: 'flex mr-[10px] items-center align-middle hover:border-b-1 hover:border-primary',
    leftIcon: 'text-secondary-contrast-lighter',
    label: 'font-content text-secondary-contrast-lighter p-2',
    rightIcon: 'text-secondary-contrast-lighter',
  };
  const mergedClassnames = { ...classNamesDefaults, ...classNames };

  return (
    <div className={extractClassName('root', mergedClassnames)} role="button">
      {leftIcon ? (
        <Icon
          icon={leftIcon}
          className={extractClassName('leftIcon', mergedClassnames)}
        />
      ) : null}
      <p className={extractClassName('label', mergedClassnames)}> {name} </p>
      {rightIcon ? (
        <Icon
          icon={rightIcon}
          className={extractClassName('rightIcon', mergedClassnames)}
        />
      ) : null}
    </div>
  );
};

export interface TopBarProps {
  readonly items: TopIconButtonProps[];
  readonly showLogin?: boolean;
  readonly classNames?: Record<string, string>;
}

const TopBar = ({ items, showLogin = false, classNames = {} }: TopBarProps) => {
  const classNamesDefaults = {
    root: 'flex justify-end items-center align-middle w-100 h-10 bg-secondary-lighter',
  };

  const mergedClassnames = { ...classNamesDefaults, ...classNames };

  return (
    <div>
      <header className={extractClassName('root', mergedClassnames)}>
        <nav className="flex items-center align-middle">
          {items.map((x) => {
            return (
              <a className="flex" href={`${x.href}`} key={`${x.href}_${x.name}`}>
                <TopIconButton
                  name={x.name}
                  leftIcon={x.leftIcon}
                  rightIcon={x.rightIcon}
                  classNames={x.classNames}
                />
                <div className="pr-2 ml-1 border-solid h-6 " />
              </a>
            );
          })}
          {showLogin ? <LoginAccountButton /> : null}
          {showLogin ? <LoginButton /> : null}
        </nav>
      </header>
    </div>
  );
};

export default TopBar;
