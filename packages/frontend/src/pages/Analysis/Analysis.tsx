import React from 'react';
import { Center } from '@mantine/core';
import { NavPageLayout } from '../../features/Navigation';
import AnalysisPanel from '../../features/Analysis/AnalysisPanel';
import AnalysisCenterWithSections from '../../features/Analysis/AnalysisCenterWithSections';
import { AnalysisPageLayoutProps } from './types';
import { ErrorCard } from '../../components/MessageCards';

const AnalysisPage = ({
  headerProps,
  footerProps,
  tools,
  sections,
  classNames,
}: AnalysisPageLayoutProps): JSX.Element => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Analysis Center',
        content: 'Analysis Center',
        key: 'gen3-analysis-center',
      }}
    >
      {!tools && !sections && (
        <Center className="mt-20">
          <ErrorCard message="No tools or sections found" />
        </Center>
      )}
      {tools && <AnalysisPanel tools={tools} />}
      {sections && (
        <AnalysisCenterWithSections
          sections={sections}
          classNames={classNames}
        />
      )}
    </NavPageLayout>
  );
};

export default AnalysisPage;
