import type { ReactElement } from 'react';
import React from 'react';
import { Divider } from '@mantine/core';
import { mergeDefaultTailwindClassnames } from '../../../utils/mergeDefaultTailwindClassnames';
import { extractClassName } from '../utils';
import { LoginButtonVisibility } from '../../../components/Login/types';
import type { StylingOverrideWithMergeControl } from '../../../types';
import { IconButton } from './IconButton';
import { AccountButton } from './AccountButton';
import { LoginButton } from './LoginButton';
import type { TopBarItems, TopBarProps } from './types';
import { isTopBarLinkButton } from './types';
import { modals } from '@mantine/modals';

const processTopBarItems = (
  items: TopBarItems[],
  classNames: StylingOverrideWithMergeControl,
  dividerClassname: string,
): ReactElement[] => {
  return items.reduce((acc: ReactElement[], item: TopBarItems) => {
    const mergedClassnames = item?.classNames
      ? mergeDefaultTailwindClassnames(classNames, item.classNames)
      : classNames;

    const Custom = item.component;
    acc.push(
      isTopBarLinkButton(item) ? (
        <React.Fragment key={`${item.href}_${item.name}-topbar-item`}>
          <a
            className="flex"
            href={item.href}
            target={item.newWindow === true ? '_blank' : undefined}
            rel={item.newWindow === true ? 'noreferrer' : undefined}
          >
            {Custom ? (
              Custom
            ) : (
              <IconButton
                name={item.name}
                iconSize={item.iconSize}
                leftIcon={item.leftIcon}
                rightIcon={item.rightIcon}
                classNames={mergedClassnames}
              />
            )}
          </a>
          <Divider
            size="md"
            orientation="vertical"
            classNames={{ root: dividerClassname }}
          />
        </React.Fragment>
      ) : (
        <React.Fragment key={`${item.name}-topbar-item`}>
          {Custom ? (
            Custom
          ) : (
            <IconButton
              name={item.name}
              iconSize={item.iconSize}
              leftIcon={item.leftIcon}
              rightIcon={item.rightIcon}
              classNames={mergedClassnames}
              clickHandler={() =>
                item?.modal &&
                modals.openContextModal({
                  modal: item.modal,
                  innerProps: {},
                  size: 'xl',
                })
              }
            />
          )}
          <Divider
            size="md"
            orientation="vertical"
            classNames={{ root: dividerClassname }}
          />
        </React.Fragment>
      ),
    );
    return acc;
  }, []);
};

const TopBar = ({
  items,
  loginButtonVisibility = LoginButtonVisibility.Hidden,
  externalLoginUrl,
  classNames = {},
  itemClassnames = {},
}: TopBarProps) => {
  const classNamesDefaults = {
    root: 'flex justify-end items-center align-middle w-full bg-secondary-lighter',
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
            mergedItemClassnames,
            extractClassName('divider', mergedClassnames),
          )}
          {loginButtonVisibility != LoginButtonVisibility.Hidden ? (
            <>
              <span className="flex items-center align-middle [&>*:only-child]:hidden">
                <AccountButton classNames={mergedItemClassnames} />
                <Divider
                  size="md"
                  classNames={{
                    root: extractClassName('divider', mergedClassnames),
                  }}
                  orientation="vertical"
                />
              </span>
              <LoginButton
                visibility={loginButtonVisibility}
                externalLoginUrl={externalLoginUrl}
                classNames={mergedItemClassnames}
              />
            </>
          ) : null}
        </div>
      </header>
    </div>
  );
};

export default TopBar;
