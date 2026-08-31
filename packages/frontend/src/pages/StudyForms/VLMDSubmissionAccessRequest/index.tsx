import React from 'react';
import { NavPageLayout } from '../../../features/Navigation';
import type { NavPageLayoutProps } from '../../../features/Navigation';
import GenericRegistrationAccessRequestForm from '../../../features/DiscoveryForms/GenericRegistrationAccessRequest';
import type { GenericRegistrationAccessRequestFormConfig } from '../../../features/DiscoveryForms/GenericRegistrationAccessRequest/types';

interface VLMDSubmissionAccessRequestFormPageProps extends NavPageLayoutProps {
  config: GenericRegistrationAccessRequestFormConfig;
}

const VLMDSubmissionAccessRequestFormPage = ({
  headerProps,
  footerProps,
  config,
}: VLMDSubmissionAccessRequestFormPageProps) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Theme Page',
        content: 'Theme page',
        key: 'gen3-theme-page',
      }}
    >
      <GenericRegistrationAccessRequestForm config={config} />
    </NavPageLayout>
  );
};

export default VLMDSubmissionAccessRequestFormPage;
