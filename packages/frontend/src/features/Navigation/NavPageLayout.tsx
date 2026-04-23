import React, { PropsWithChildren } from 'react';
import Head from 'next/head';
import Footer from './Footer/Footer';
import Header from './Header';
import { NavPageLayoutProps } from './types';
import LeftSidePanel from './Vertical/LeftSidePanel';

const NavPageLayout = ({
  headerProps,
  footerProps,
  mainProps,
  headerMetadata,
  CustomHeaderComponent,
  CustomFooterComponent,
  children,
}: PropsWithChildren<NavPageLayoutProps>) => {
  const mainContentStyle = mainProps?.fixed
    ? 'flex-1 flex overflow-hidden relative'
    : 'flex grow relative';
  return (
    <div className="flex flex-col justify-between h-full">
      <Head>
        <title>{headerMetadata.title}</title>
        <meta
          property="og:title"
          content={headerMetadata.content}
          key={headerMetadata.key}
        />
      </Head>
      {CustomHeaderComponent ? (
        <CustomHeaderComponent {...headerProps} />
      ) : (
        <Header {...headerProps}>
          <title>{headerMetadata.title}</title>
          <meta
            property="og:title"
            content={headerMetadata.content}
            key={headerMetadata.key}
          />
        </Header>
      )}
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
      {CustomFooterComponent ? (
        <CustomFooterComponent {...footerProps} />
      ) : (
        <Footer {...footerProps} />
      )}
    </div>
  );
};

export default NavPageLayout;
