// StudyRegistrationAccessRequestForm.tsx
import React from 'react';
import {
  NavPageLayout,
  NavPageLayoutProps,
} from '../../../features/Navigation';
import StudyRegistrationAccessRequestForm from '../../../features/DiscoveryForms/StudyRegistrationAccessRequest';

interface StudyRegistrationAccessRequestFormPageProps extends NavPageLayoutProps {
  configStudyRegistrationRequestAccessForm: any;
  studyName: string;
}

const StudyRegistrationAccessRequestFormPage = ({
  headerProps,
  footerProps,
  configStudyRegistrationRequestAccessForm,
}: StudyRegistrationAccessRequestFormPageProps) => {
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

export default StudyRegistrationAccessRequestFormPage;
