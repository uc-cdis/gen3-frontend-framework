import React, { PropsWithChildren } from 'react';
import Head from 'next/head';
import Footer from './Footer/Footer';
import Header from './Header';
import { HeaderData, HeaderProps, MainContentProps } from './types';
import LeftSidePanel from './Vertical/LeftSidePanel';
import { FooterProps } from './Footer/types';

export interface NavPageLayoutProps {
  headerProps: Readonly<HeaderProps>;
  footerProps: Readonly<FooterProps>;
  mainProps?: Partial<MainContentProps>;
  headerData: HeaderData;
}

const NavPageLayout = ({
  headerProps,
  footerProps,
  mainProps,
  headerData,
  children,
}: PropsWithChildren<NavPageLayoutProps>) => {
  const mainContentStyle = mainProps?.fixed
    ? 'flex-1 flex overflow-hidden'
    : 'flex grow';
  return (
    <div className="flex flex-col justify-between h-screen">
      <Head>
        <title>{headerData.title}</title>
        <meta
          property="og:title"
          content={headerData.content}
          key={headerData.key}
        />
      </Head>
      <Header {...headerProps}>
        <title>{headerData.title}</title>
        <meta
          property="og:title"
          content={headerData.content}
          key={headerData.key}
        />
      </Header>
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
