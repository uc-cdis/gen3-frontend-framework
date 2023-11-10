import React from 'react';
import TopBar from './TopBar';
import NavigationBar from './NavigationBar';
import { HeaderProps } from './types';
import HorizontalNavigationBar from './HorizontalClean/HorizontalNavigationBar';

const Header: React.FC<HeaderProps> = ({
  top,
  navigation,
  type = undefined,
}: HeaderProps) => {
  return type === 'horizontal' ? (
    <div className="w-100">
      <HorizontalNavigationBar
        logo={navigation.logo}
        title={navigation.title}
        items={navigation.items}
        classNames={{ ...navigation.classNames }}
        actions={top}
      />
    </div>
  ) : type === 'vertical' ? (
    <HorizontalNavigationBar
      logo={navigation.logo}
      title={navigation.title}
      classNames={{ ...navigation.classNames }}
      actions={top}
    />
  ) : (
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
