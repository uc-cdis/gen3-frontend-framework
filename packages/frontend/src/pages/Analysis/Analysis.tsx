import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import AnalysisPanel from '../../features/Analysis/AnalysisPanel';
import { AnalysisPageLayoutProps } from './types';

const AnalysisPage = ({
  headerProps,
  footerProps,
}: AnalysisPageLayoutProps): JSX.Element => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <AnalysisPanel analysis={[]}/>
    </NavPageLayout>
  );
};

export default AnalysisPage;
