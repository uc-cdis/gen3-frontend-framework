import React from 'react';
import type { ReactElement } from 'react';
import { NavPageLayout } from '../../../features/Navigation';
import type { NavPageLayoutProps } from '../../../features/Navigation';
import VLMDSubmissionForm from '../../../features/DiscoveryForms/VLMDSubmission/VLMDSubmissionForm';
import type { VLMDSubmissionConfig } from '../../../features/DiscoveryForms/VLMDSubmission/types';

interface VLMDSubmissionPageProps extends NavPageLayoutProps {
  config: VLMDSubmissionConfig;
}

const VLMDSubmissionPage = ({
  headerProps,
  footerProps,
  config,
}: VLMDSubmissionPageProps): ReactElement => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'VLMD Submission',
        content: 'Variable Level Metadata Submission',
        key: 'vlmd-submission',
      }}
    >
      <VLMDSubmissionForm config={config} />
    </NavPageLayout>
  );
};

export default VLMDSubmissionPage;
