import React, { PropsWithChildren } from 'react';
import Footer from './Footer';
import Header from './Header';
import { FooterProps, HeaderProps, MainContentProps } from './types';
import LeftSidePanel from './Vertical/LeftSidePanel';

export interface NavPageLayoutProps {
  headerProps: HeaderProps;
  footerProps: FooterProps;
  mainProps?: Partial<MainContentProps>;
}

const NavPageLayout = ({
  headerProps,
  footerProps,
  mainProps,
  children,
}: PropsWithChildren<NavPageLayoutProps>) => {
  const mainContentStyle = mainProps?.fixed
    ? 'flex-1 flex overflow-hidden'
    : 'flex grow';
  return (
    <div className="flex flex-col grow justify-between h-screen">
      <Header {...headerProps} />
      {headerProps.type === 'vertical' ? (
        <div className="flex grow">
          <LeftSidePanel
            items={headerProps.navigation.items}
            classNames={headerProps.navigation.classNames}
          />
          <main className={mainContentStyle}>{children}</main>
        </div>
      ) : (
        <main className={mainContentStyle}>{children}</main>
      )}
      <Footer {...footerProps} />
    </div>
  );
};

export default NavPageLayout;
