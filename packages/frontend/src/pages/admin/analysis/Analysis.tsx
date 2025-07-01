import React from 'react';
import {
  NavPageLayout,
  NavPageLayoutProps,
} from '../../../features/Navigation';
import AnalysisCardEditor from '../../../features/Analysis/AnalysisCardEditor';

interface Props extends NavPageLayoutProps {
  analysisFile?: any;
}

const AnalysisEditorPage = ({ headerProps, footerProps }: Props) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerProps={headerProps}
      headerMetadata={{
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
