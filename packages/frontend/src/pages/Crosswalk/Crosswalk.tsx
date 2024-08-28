import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import { CrosswalkPanel } from '../../features/Crosswalk';
import { CrosswalkPageLayoutProps } from './types';

const CrosswalkPage = ({
  headerProps,
  footerProps,
  config,
}: CrosswalkPageLayoutProps): JSX.Element => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Gen3 Crosswalk Page',
        content: 'Crosswalk Data',
        key: 'gen3-crosswalk-page',
      }}
    >
      <CrosswalkPanel {...config} />
    </NavPageLayout>
  );
};

export default CrosswalkPage;
