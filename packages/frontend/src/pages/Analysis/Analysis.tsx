import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import AnalysisPanel from '../../features/Analysis/AnalysisPanel';
import { AnalysisPageLayoutProps } from './types';

const AnalysisPage = ({
  headerProps,
  footerProps,
  tools,
}: AnalysisPageLayoutProps): JSX.Element => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Gen3 Analysis Center',
        content: 'Analysis Center',
        key: 'gen3-analysis-center',
      }}
    >
      <AnalysisPanel tools={tools} />
    </NavPageLayout>
  );
};

export default AnalysisPage;
