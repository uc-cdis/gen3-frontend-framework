import React from 'react';
import TopBar from './TopBar/TopBar';
import NavigationBar from './NavigationBar';
import { Banner } from './Banner';
import { HeaderProps } from './types';
import HorizontalNavigationBar from './HorizontalClean/HorizontalNavigationBar';

/**
 * Header component.
 *
 * @param {object} props - The properties for the Header component.
 * @param {object} props.topBar - The top bar items and configuration.
 * @param {object} props.navigation - The navigation bar items and configuration.
 * @param {string} props.type - The type of header to render. Default value is 'original'.
 * @returns {JSX.Element} - The rendered Header component.
 */
const Header = ({
  topBar,
  navigation,
  banners,
  type = 'original',
}: HeaderProps) => {
  return type === 'horizontal' ? (
    <div className="w-full">
      {banners?.map((banner) => (
        <Banner {...banner} key={banner.id} />
      ))}
      <HorizontalNavigationBar
        logo={navigation.logo}
        title={navigation.title}
        items={navigation.items}
        classNames={{ ...navigation.classNames }}
        actions={topBar}
      />
    </div>
  ) : type === 'vertical' ? (
    <div>
      {banners?.map((banner) => (
        <Banner {...banner} key={banner.id} />
      ))}
      <HorizontalNavigationBar
        logo={navigation.logo}
        title={navigation.title}
        classNames={{ ...navigation.classNames }}
        actions={topBar}
      />
    </div>
  ) : (
    <div className="w-full">
      <TopBar
        items={topBar.items}
        loginButtonVisibility={topBar?.loginButtonVisibility}
        externalLoginUrl={topBar?.externalLoginUrl}
        classNames={{ ...topBar.classNames }}
        itemClassnames={{ ...topBar.itemClassnames }}
      />
      {banners?.map((banner) => (
        <Banner {...banner} key={banner.id} />
      ))}
      <NavigationBar
        logo={navigation.logo}
        title={navigation.title}
        items={navigation.items}
        classNames={navigation?.classNames}
        hideUnauthorizedLinks={navigation?.hideUnauthorizedLinks}
      />
    </div>
  );
};

export default Header;
