import React from 'react';
import GenericRegistrationAccessRequestForm from '../../../features/DiscoveryForms/GenericRegistrationAccessRequest';
import { NavPageLayout } from '../../../features/Navigation';
import type { GenericRegistrationAccessRequestFormConfig } from '../../../features/DiscoveryForms/GenericRegistrationAccessRequest/types';
import type { NavPageLayoutProps } from '../../../features/Navigation';

interface StudyRegistrationAccessRequestPageProps extends NavPageLayoutProps {
  config: GenericRegistrationAccessRequestFormConfig;
}

const StudyRegistrationAccessRequestPage = ({
  headerProps,
  footerProps,
  config,
}: StudyRegistrationAccessRequestPageProps) => {
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

export default StudyRegistrationAccessRequestPage;
