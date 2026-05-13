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
const Header =  React.forwardRef<HTMLDivElement, HeaderProps>(
  ({
  topBar,
  navigation,
  banners,
  type = 'original',
}, ref) => {
  return type === 'horizontal' ? (
    <div className="w-full" ref={ref}>
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
    <div ref={ref}>
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
    <div className="w-full" ref={ref}>
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
});

Header.displayName = 'Header';

export default Header;
