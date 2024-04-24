import React from 'react';
import TopBar from './TopBar';
import NavigationBar from './NavigationBar';
import { HeaderProps } from './types';
import HorizontalNavigationBar from './HorizontalClean/HorizontalNavigationBar';
import { useGetCSRFQuery } from '@gen3/core';

/**
 * Header component.
 *
 * @param {object} props - The properties for the Header component.
 * @param {object} props.top - The top bar items and configuration.
 * @param {object} props.navigation - The navigation bar items and configuration.
 * @param {string} props.type - The type of header to render. Default value is 'original'.
 * @returns {JSX.Element} - The rendered Header component.
 */
const Header = ({ top, navigation, type = 'original' }: HeaderProps) => {
  useGetCSRFQuery();
  return type === 'horizontal' ? (
    <div className="w-full">
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
      <TopBar
        items={top.items}
        showLogin={top?.showLogin}
        classNames={{ ...top.classNames }}
      />
      <NavigationBar
        logo={navigation.logo}
        title={navigation.title}
        items={navigation.items}
      />
    </div>
  );
};

export default Header;
