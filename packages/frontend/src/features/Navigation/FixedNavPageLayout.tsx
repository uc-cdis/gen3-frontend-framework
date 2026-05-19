import React, { PropsWithChildren } from 'react';
import Head from 'next/head';
import { useResizeObserver } from '@mantine/hooks';
import Footer from './Footer/Footer';
import Header from './Header';
import { NavPageLayoutProps } from './types';
import LeftSidePanel from './Vertical/LeftSidePanel';

const FixedNavPageLayout = ({
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

  const [headerRef, headerRect] = useResizeObserver<HTMLDivElement>();
  const [footerRef, footerRect] = useResizeObserver();

  return (
    <div className="flex flex-col justify-between h-full min-h-dvh">
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
        <Header {...headerProps} ref={headerRef} />
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
        <main
          className={mainContentStyle}
          style={{
            height: `calc(100vh - ${headerRect?.height ?? 0}px - ${footerRect?.height ?? 0}px)`,
          }}
        >
          {children}
        </main>
      )}
      {CustomFooterComponent ? (
        <CustomFooterComponent {...footerProps} />
      ) : (
        <Footer {...footerProps} ref={footerRef} />
      )}
    </div>
  );
};

FixedNavPageLayout.displayName = 'FixedNavPageLayout';

export default FixedNavPageLayout;
