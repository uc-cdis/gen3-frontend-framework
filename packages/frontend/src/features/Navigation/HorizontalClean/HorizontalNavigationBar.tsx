import React from 'react';
import Link from 'next/link';
import { NavigationProps } from '../types';
import NavigationBarButton from '../NavigationBarButton';
import NavigationLogo from '../NavigationLogo';
import { TopBarProps, TopIconButtonProps } from "../TopBar";
import LoginButton from '../../../components/Login/LoginButton';
import { BiLogInCircle as LoginIcon } from 'react-icons/bi';
import { PiDotsThreeCircleThin as DotsIcon } from 'react-icons/pi';
import { extractClassName } from '../utils';
import { ActionIcon, Menu, Text} from '@mantine/core';

interface ActionMenuProps {
  items: TopIconButtonProps[];
}

const ActionMenu:React.FC<ActionMenuProps> = ( { items } : ActionMenuProps) => {
  return (<>
    <Menu>
      <Menu.Target>
        <button><DotsIcon size={'3.15rem'} /></button>
      </Menu.Target>
      <Menu.Dropdown>
        { items.map((x, index) => {
          return (
            <Menu.Item key={`${x.name}-${index}`}>
               <Link href={x.href} >
                  <Text>{x.name}</Text>
              </Link>
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
    </>);
};

export interface HorizontalNavigationBarProps extends NavigationProps {
  readonly actions: TopBarProps;
}

const HorizontalNavigationBar: React.FC<HorizontalNavigationBarProps> = ({
  actions,
  items,
  logo = undefined,
  classNames = {}
}: HorizontalNavigationBarProps) => {

  const classNamesDefaults =
  {

    navigationPanel: 'font-heading font-bold tracking-wide text-xl space-x-4',
    login: 'pl-1 mr-6 bg-base-max text-base-contrast opacity-80 hover:opacity-100',
  };

  const mergedClassnames = {...classNamesDefaults, ...classNames};

  return (
    <div className={`flex justify-between ${extractClassName('root', mergedClassnames)}`}>
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
        {items.map((x, index) => {
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

export default HorizontalNavigationBar;
