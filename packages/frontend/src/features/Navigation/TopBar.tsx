import React from 'react';
import { Icon } from '@iconify/react';
import LoginButton from '../Login/LoginButton';
import LoginAccountButton from '../Login/LoginAccountButton';

export interface NameAndIcon {
  readonly name: string;
  readonly rightIcon?: string;
  readonly leftIcon?: string;
}

export interface TopIconButtonProps extends NameAndIcon {
  readonly href: string;
}

const TopIconButton: React.FC<NameAndIcon> = ({
  name,
  leftIcon = undefined,
  rightIcon = undefined,
}: NameAndIcon) => {
  return (
    <div
      className="flex flex-row mr-[10px] items-center align-middle hover:border-b-1 hover:border-gen3-white "
      role="button"
    >
      {leftIcon ? <Icon icon={leftIcon} className="text-secondary-contrast-lighter" /> : null}
      <p className="font-content secondary-contrast-lighter p-2"> {name} </p>
      {rightIcon ? <Icon icon={rightIcon} className="text-secondary-contrast-lighter" /> : null}
    </div>
  );
};

export interface TopBarProps {
  readonly items: TopIconButtonProps[];
  readonly showLogin?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  items,
  showLogin = false,
}: TopBarProps) => {
  return (
    <div>
      <header className="flex flex-row justify-end items-center align-middle w-100 h-10 bg-secondary-lighter">
        <nav className="flex flex-row items-center align-middle font-montserrat">
          {items.map((x) => {
            return (
              <a className="flex flex-row" href={`${x.href}`} key={x.href}>
                <TopIconButton
                  name={x.name}
                  leftIcon={x.leftIcon}
                  rightIcon={x.rightIcon}
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
