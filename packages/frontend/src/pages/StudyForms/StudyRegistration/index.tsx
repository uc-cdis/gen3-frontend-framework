import React from 'react';
import {
  NavPageLayout,
  NavPageLayoutProps,
} from '../../../features/Navigation';
import StudyRegistrationForm from '../../../features/DiscoveryForms/StudyRegistration';
import { StudyRegistrationFormConfig } from './types';

interface StudyRegistrationFormPageProps extends NavPageLayoutProps {
  configStudyRegistrationForm: StudyRegistrationFormConfig;
  studyName: string;
}

const StudyRegistrationPage = ({
  headerProps,
  footerProps,
  configStudyRegistrationForm,
}: StudyRegistrationFormPageProps) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Theme Page',
        content: 'Theme page',
        key: 'gen3-theme-page',
      }}
    >
      <StudyRegistrationForm
        configStudyRegistrationForm={configStudyRegistrationForm}
      />
    </NavPageLayout>
  );
};

export default StudyRegistrationPage;
