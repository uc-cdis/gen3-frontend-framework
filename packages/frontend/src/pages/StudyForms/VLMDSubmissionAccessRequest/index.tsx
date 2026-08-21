import React from 'react';
import { NavPageLayout } from '../../../features/Navigation';
import type { NavPageLayoutProps } from '../../../features/Navigation';
import StudyRegistrationAccessRequestForm from '../../../features/DiscoveryForms/StudyRegistrationAccessRequest';

interface VLMDSubmissionAccessRequestFormPageProps extends NavPageLayoutProps {
  configStudyRegistrationRequestAccessForm: unknown;
}

const VLMDSubmissionAccessRequestFormPage = ({
  headerProps,
  footerProps,
  configStudyRegistrationRequestAccessForm,
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
      <StudyRegistrationAccessRequestForm
        configStudyRegistrationRequestAccessForm={
          configStudyRegistrationRequestAccessForm
        }
      />
    </NavPageLayout>
  );
};

export default VLMDSubmissionAccessRequestFormPage;
