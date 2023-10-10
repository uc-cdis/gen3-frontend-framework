import React from 'react';
import { NavPageLayout, NavPageLayoutProps } from '../../features/Navigation';

const ExplorerPage = ({
  headerProps,
  footerProps,
}: NavPageLayoutProps): JSX.Element => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <div></div>
    </NavPageLayout>
  );
};

export default ExplorerPage;
