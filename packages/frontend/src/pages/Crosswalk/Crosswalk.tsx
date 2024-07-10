import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import { Crosswalk } from '../../features/Crosswalk';
import { CrosswalkPageLayoutProps } from './types';

const CrosswalkPage = ({
  headerProps,
  footerProps,
  config,
}: CrosswalkPageLayoutProps): JSX.Element => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <Crosswalk {...config} />
    </NavPageLayout>
  );
};

export default CrosswalkPage;
