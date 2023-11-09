import React, { PropsWithChildren } from 'react';
import Footer from './Footer';
import Header from './Header';
import { FooterProps, HeaderProps } from "./types";

export interface NavPageLayoutProps {
  headerProps: HeaderProps;
  footerProps: FooterProps;
}

const NavPageLayout: React.FC<NavPageLayoutProps> = ({
  headerProps,
  footerProps,
  children,
}: PropsWithChildren<NavPageLayoutProps>) => {
  console.log("NavPageLayout", headerProps);
  return (
    <div className="flex flex-col h-[100vh]">
      <Header {...headerProps} />
      <main className="flex-grow">{children}</main>
      <Footer {...footerProps} />
    </div>
  );
};

export default NavPageLayout;
