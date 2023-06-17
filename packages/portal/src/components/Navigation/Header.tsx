import React from 'react';
import TopBar, { TopBarProps } from './TopBar';
import NavigationBar from './NavigationBar';
import { NavigationProps } from './types';

export interface HeaderProps {
  readonly top: TopBarProps;
  readonly navigation: NavigationProps;
}

const Header: React.FC<HeaderProps> = ({ top, navigation }: HeaderProps) => {
  return (
    <div className="w-100">
      <TopBar items={top.items} showLogin={top?.showLogin} />
      <NavigationBar
        logo={navigation.logo}
        title={navigation.title}
        items={navigation.items}
      />
    </div>
  );
};

export default Header;
