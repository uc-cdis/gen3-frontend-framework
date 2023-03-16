import React from 'react';
import TopBar, {TopBarProps} from './TopBar';
import NavigationBar, { NavigationProps } from './NavigationBar';
import { Banner, BannerProps } from './Banner';

export interface HeaderProps {
    readonly top: TopBarProps;
    readonly navigation: NavigationProps;
    readonly banners: BannerProps[];
}

const Header: React.FC<HeaderProps> = ({ top, navigation, banners }: HeaderProps) => {
  return (
    <div className='w-100'>
      <TopBar items={top.items} />
      {banners.map((banner) => (
        <Banner {...banner} key={banner.id} />
      ))}
      <NavigationBar logo={navigation.logo} title={navigation.title} items={navigation.items} />
    </div>
  );
};

export default Header;
