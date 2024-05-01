import React, { PropsWithChildren } from 'react';
import Footer from './Footer';
import Header from './Header';
import { FooterProps, HeaderProps } from './types';
import LeftSidePanel from './Vertical/LeftSidePanel';

export interface NavPageLayoutProps {
  headerProps: HeaderProps;
  footerProps: FooterProps;
}

const NavPageLayout = ({
  headerProps,
  footerProps,
  children,
}: PropsWithChildren<NavPageLayoutProps>) => {
  return (
    <div className="flex flex-col justify-between h-[100vh]">
      <Header {...headerProps} />
      {headerProps.type === 'vertical' ? (
        <div className="flex grow ">
          <LeftSidePanel items={headerProps.navigation.items}  classNames={headerProps.navigation.classNames}/>
          <main className="flex-grow">{children}</main>
        </div>
      ) : (
        <main className="flex grow">{children}</main>
      )}
      <Footer {...footerProps} />
    </div>
  );
};

export default NavPageLayout;
