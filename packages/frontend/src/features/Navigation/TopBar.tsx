import React, { ReactElement } from 'react';
import { Divider } from '@mantine/core';
import { mergeDefaultTailwindClassnames } from '../../utils/mergeDefaultTailwindClassnames';
import LoginButton from '../../components/Login/LoginButton';
import LoginAccountButton from '../../components/Login/LoginAccountButton';
import { extractClassName } from './utils';
import { LoginButtonVisibility } from '../../components/Login/types';
import { StylingOverrideWithMergeControl } from '../../types';
import { TopIconButton, TopIconButtonProps } from './TopIconButton';

const processTopBarItems = (
  items: TopIconButtonProps[],
  showLogin: boolean,
  classNames: StylingOverrideWithMergeControl,
  dividerClassname: string,
): ReactElement[] => {
  return items.reduce(
    (acc: ReactElement[], item: TopIconButtonProps, index: number) => {
      const needsBorder = !(index === items.length - 1 && !showLogin);
      const mergedClassnames = item?.classNames
        ? mergeDefaultTailwindClassnames(classNames, item.classNames)
        : classNames;
      acc.push(
        <a className="flex" href={item.href} key={`${item.href}_${item.name}`}>
          {' '}
          <TopIconButton
            name={item.name}
            iconSize={item.iconSize}
            leftIcon={item.leftIcon}
            rightIcon={item.rightIcon}
            classNames={mergedClassnames}
          />{' '}
          <Divider
            size="md"
            orientation="vertical"
            classNames={{ root: dividerClassname }}
          />
        </a>,
      );
      return acc;
    },
    [],
  );
};

export interface TopBarProps {
  readonly items: TopIconButtonProps[];
  readonly loginButtonVisibility?: LoginButtonVisibility;
  readonly externalLoginUrl?: string;
  readonly classNames?: StylingOverrideWithMergeControl;
  readonly itemClassnames?: StylingOverrideWithMergeControl;
}

const TopBar = ({
  items,
  loginButtonVisibility = LoginButtonVisibility.Hidden,
  externalLoginUrl,
  classNames = {},
  itemClassnames = {},
}: TopBarProps) => {
  const classNamesDefaults = {
    root: 'flex justify-end items-center align-middle w-100 bg-secondary-lighter',
    login: 'font-content hover:border-accent',
    divider: 'border-accent my-2',
  };

  const itemClassnameDefaults = {
    root: `flex items-center align-middle px-2 my-2`,
    button:
      'flex flex-nowrap items-center align-middle border-b-2 hover:border-accent border-transparent',
    leftIcon: 'text-secondary-contrast-lighter pr-1',
    label: 'font-content text-secondary-contrast-lighter block',
    rightIcon: 'text-secondary-contrast-lighter pl-1',
  };

  const mergedClassnames = mergeDefaultTailwindClassnames(
    classNamesDefaults,
    classNames,
  );

  const mergedItemClassnames = mergeDefaultTailwindClassnames(
    itemClassnameDefaults,
    itemClassnames,
  );

  return (
    <div>
      <header className={extractClassName('root', mergedClassnames)}>
        <div
          role="navigation"
          aria-label="top most navigation"
          className="flex items-center align-middle"
        >
          {processTopBarItems(
            items,
            loginButtonVisibility === LoginButtonVisibility.Visible,
            mergedItemClassnames,
            extractClassName('divider', mergedClassnames),
          )}
          {loginButtonVisibility != LoginButtonVisibility.Hidden ? (
            <div className="flex items-center [&>*:only-child]:hidden">
              <LoginAccountButton
                className={extractClassName('login', mergedClassnames)}
              />
              <Divider
                size="md"
                classNames={{
                  root: extractClassName('divider', mergedClassnames),
                }}
                orientation="vertical"
              />
            </div>
          ) : null}
          {loginButtonVisibility != LoginButtonVisibility.Hidden ? (
            <div className="flex items-center">
              <LoginButton
                visibility={loginButtonVisibility}
                externalLoginUrl={externalLoginUrl}
                className={extractClassName('login', mergedClassnames)}
              />
            </div>
          ) : null}
        </div>
      </header>
    </div>
  );
};

export default TopBar;
