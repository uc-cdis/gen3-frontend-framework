import React from 'react';
import TopBar from './TopBar';
import NavigationBar from './NavigationBar';
import { Banner } from './Banner';
import { HeaderProps } from './types';
import HorizontalNavigationBar from './HorizontalClean/HorizontalNavigationBar';

/**
 * Header component.
 *
 * @param {object} props - The properties for the Header component.
 * @param {object} props.top - The top bar items and configuration.
 * @param {object} props.navigation - The navigation bar items and configuration.
 * @param {string} props.type - The type of header to render. Default value is 'original'.
 * @returns {JSX.Element} - The rendered Header component.
 */
const Header = ({
  top,
  navigation,
  banners,
  type = 'original',
}: HeaderProps) => {
  return type === 'horizontal' ? (
    <div className="w-full">
      {banners?.map((banner) => <Banner {...banner} key={banner.id} />)}
      <HorizontalNavigationBar
        logo={navigation.logo}
        title={navigation.title}
        items={navigation.items}
        classNames={{ ...navigation.classNames }}
        actions={top}
      />
    </div>
  ) : type === 'vertical' ? (
    <div>
      {banners?.map((banner) => <Banner {...banner} key={banner.id} />)}
      <HorizontalNavigationBar
        logo={navigation.logo}
        title={navigation.title}
        classNames={{ ...navigation.classNames }}
        actions={top}
      />
    </div>
  ) : (
    <div className="w-100">
      <TopBar
        items={top.items}
        loginButtonVisibility={top?.loginButtonVisibility}
        externalLoginUrl={top?.externalLoginUrl}
        classNames={{ ...top.classNames }}
      />
      {banners?.map((banner) => <Banner {...banner} key={banner.id} />)}
      <NavigationBar
        logo={navigation.logo}
        title={navigation.title}
        items={navigation.items}
        classNames={navigation?.classNames}
      />
    </div>
  );
};

export default Header;
