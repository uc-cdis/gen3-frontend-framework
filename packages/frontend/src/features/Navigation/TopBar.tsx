import React, { ReactElement } from 'react';
import { Icon } from '@iconify/react';
import { Button, Text } from '@mantine/core';
import { mergeDefaultTailwindClassnames } from '../../utils/mergeDefaultTailwindClassnames';
import LoginButton from '../../components/Login/LoginButton';
import LoginAccountButton from '../../components/Login/LoginAccountButton';
import { extractClassName } from './utils';
import { LoginButtonVisibility } from '../../components/Login/types';
import { StylingOverrideWithMergeControl } from '../../types';
import { Modals, showModal, useCoreDispatch } from '@gen3/core';

export interface NameAndIcon {
  name: string;
  rightIcon?: string;
  leftIcon?: string;
  classNames: StylingOverrideWithMergeControl;
  drawBorder?: boolean;
  size?: string;
}

export interface TopIconButtonProps extends NameAndIcon {
  href?: string;
  tooltip?: string;
  modal?: string;
}

const TopIconButton = ({
  name,
  leftIcon = undefined,
  rightIcon = undefined,
  classNames = {},
  drawBorder = true,
  size = 'sm',
}: NameAndIcon) => {
  const classNamesDefaults = {
    root: `flex items-center align-middle px-2 ${
      drawBorder && 'border-r-2 border-accent'
    } my-2`,
    button:
      'flex flex-nowrap items-center align-middle border-b-2 hover:border-accent border-transparent',
    leftIcon: 'text-secondary-contrast-lighter',
    label: 'font-content text-secondary-contrast-lighter block',
    section: 'text-secondary-contrast',
    rightIcon: 'text-secondary-contrast-lighter',
  };
  const mergedClassnames = mergeDefaultTailwindClassnames(
    classNamesDefaults,
    classNames,
  );

  return (
    <div
      className={extractClassName('root', mergedClassnames)}
      aria-label={name}
    >
      <Button
        size={`compact-${size}`}
        variant="transparent"
        color="secondary-contrast.4"
        classNames={{
          root: extractClassName('button', mergedClassnames),
          section: extractClassName('section', mergedClassnames),
        }}
        leftSection={leftIcon ? <Icon icon={leftIcon} /> : null}
        rightSection={rightIcon ? <Icon icon={rightIcon} /> : null}
        style={{
          borderWidth: 0,
          borderBottomWidth: '0.2rem',
        }}
      >
        {name}
      </Button>
    </div>
  );
};
/*
  return (
    <div
      className={extractClassName('root', mergedClassnames)}
      aria-label={name}
    >
      <div
        className={extractClassName('button', mergedClassnames)}
        role="button"
      >
        {leftIcon ? (
          <Icon
            icon={leftIcon}
            className={extractClassName('leftIcon', mergedClassnames)}
          />
        ) : null}
        <Text className={extractClassName('label', mergedClassnames)}>
          {' '}
          {name}{' '}
        </Text>
        {rightIcon ? (
          <Icon
            icon={rightIcon}
            className={extractClassName('rightIcon', mergedClassnames)}
          />
        ) : null}
      </div>
    </div>
  );
};
 */

interface ModalNameAndIcon extends NameAndIcon {
  modal?: string;
}

const TopIconModalButton = ({
  name,
  leftIcon = undefined,
  rightIcon = undefined,
  classNames = {},
  drawBorder = true,
  modal = undefined,
  size = 'sm',
}: ModalNameAndIcon) => {
  const classNamesDefaults = {
    root: `flex items-center align-middle px-2 ${
      drawBorder && 'border-r-2 border-accent'
    } my-2`,
    button:
      'flex flex-nowrap items-center align-middle border-b-2 hover:border-accent border-transparent',
    leftIcon: 'text-secondary-contrast pr-1',
    label: 'font-content text-secondary-contrast-lighter block',
    rightIcon: 'text-secondary-contrast pl-1',
  };
  const mergedClassnames = mergeDefaultTailwindClassnames(
    classNamesDefaults,
    classNames,
  );

  const dispatch = useCoreDispatch();

  const onClick = () => {
    if (modal) dispatch(showModal({ modal: modal as Modals }));
  };

  return (
    <div
      className={extractClassName('root', mergedClassnames)}
      aria-label={name}
    >
      <Button
        size={`compact-${size}`}
        variant="transparent"
        color="secondary-contrast.4"
        classNames={{ root: extractClassName('button', mergedClassnames) }}
        onClick={onClick}
        leftSection={
          leftIcon ? (
            <Icon
              icon={leftIcon}
              className={extractClassName('leftIcon', mergedClassnames)}
            />
          ) : null
        }
        rightSection={
          rightIcon ? (
            <Icon
              icon={rightIcon}
              className={extractClassName('rightIcon', mergedClassnames)}
            />
          ) : null
        }
        style={{
          borderWidth: 0,
          borderBottomWidth: '0.2rem',
        }}
      >
        {name}
      </Button>
    </div>
  );
};

const processTopBarItems = (
  items: TopIconButtonProps[],
  showLogin: boolean,
): ReactElement[] => {
  console.log(items);
  return items.reduce(
    (acc: ReactElement[], item: TopIconButtonProps, index: number) => {
      const needsBorder = !(index === items.length - 1 && !showLogin);
      if (item?.modal)
        acc.push(
          <TopIconModalButton
            key={item.name}
            name={item.name}
            leftIcon={item.leftIcon}
            rightIcon={item.rightIcon}
            classNames={item.classNames}
            drawBorder={needsBorder}
            modal={item.modal}
          />,
        );
      else {
        if (item.href)
          acc.push(
            <a
              className="flex"
              href={item.href}
              key={`${item.href}_${item.name}`}
            >
              {' '}
              <TopIconButton
                name={item.name}
                leftIcon={item.leftIcon}
                rightIcon={item.rightIcon}
                classNames={item.classNames}
                drawBorder={needsBorder}
              />{' '}
            </a>,
          );
      }
      return acc;
    },
    [],
  );
};

export interface TopBarProps {
  readonly items: TopIconButtonProps[];
  readonly loginButtonVisibility?: LoginButtonVisibility;
  readonly classNames?: StylingOverrideWithMergeControl;
}

const TopBar = ({
  items,
  loginButtonVisibility = LoginButtonVisibility.Hidden,
  classNames = {},
}: TopBarProps) => {
  const classNamesDefaults = {
    root: 'flex justify-end items-center align-middle w-100 bg-secondary-lighter',
    login: 'font-content hover:border-accent',
  };

  const mergedClassnames = mergeDefaultTailwindClassnames(
    classNamesDefaults,
    classNames,
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
          )}
          {loginButtonVisibility != LoginButtonVisibility.Hidden ? (
            <LoginAccountButton
              className={extractClassName('login', mergedClassnames)}
            />
          ) : null}
          {loginButtonVisibility != LoginButtonVisibility.Hidden ? (
            <LoginButton
              visibility={loginButtonVisibility}
              className={extractClassName('login', mergedClassnames)}
            />
          ) : null}
        </div>
      </header>
    </div>
  );
};

export default TopBar;
