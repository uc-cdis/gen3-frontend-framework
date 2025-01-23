import React from 'react';
import {
  NavPageLayout,
  NavPageLayoutProps,
} from '../../../features/Navigation';
import AnalysisCardEditor from '../../../features/Analysis/AnalysisCardEditor';

interface Props extends NavPageLayoutProps {
  analysisFile?: any;
}

const AnalysisEditorPage = ({
  headerProps,
  footerProps,
  analysisFile,
}: Props) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerProps={headerProps}
      headerData={{
        title: 'Gen3 Analysis Editor Page',
        content: 'Analysis Editor page',
        key: 'gen3-analysis-editor-page',
      }}
    >
      <AnalysisCardEditor />
    </NavPageLayout>
  );
};

export default AnalysisEditorPage;
