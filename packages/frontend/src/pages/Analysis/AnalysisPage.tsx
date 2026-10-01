import type { JSX } from 'react';
import React from 'react';
import { Center } from '@mantine/core';
import { FixedNavPageLayout, NavPageLayout } from '../../features/Navigation';
import AnalysisPanel from '../../features/Analysis/AnalysisPanel';
import AnalysisCenterWithSections from '../../features/Analysis/AnalysisCenterWithSections';
import type { AnalysisPageLayoutProps } from './types';
import { ErrorCard } from '../../components/MessageCards';
import AnalysisWithCloseButton from '../../features/Analysis/AnalysisCenterWithBackButton';

const AnalysisPage = ({
  headerProps,
  footerProps,
  tools,
  sections,
  classNames,
  type = 'section',
  label,
  description,
}: AnalysisPageLayoutProps): JSX.Element => {
  if (type === 'breadcrumb') {
    return (
      <FixedNavPageLayout
        {...{ headerProps, footerProps }}
        headerMetadata={{
          title: 'Gen3 Analysis Center',
          content: 'Analysis Center',
          key: 'gen3-analysis-center',
        }}
      >
        <AnalysisWithCloseButton
          tools={tools ?? []}
          label={label}
          description={description}
        />
      </FixedNavPageLayout>
    );
  }

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
