// StudyRegistrationAccessRequestForm.tsx
import React from 'react';
import { Box, Text } from '@mantine/core';
import {
  NavPageLayout,
  NavPageLayoutProps,
} from '../../../features/Navigation';
import StudyRegistrationForm from '../../../features/DiscoveryForms/StudyRegistration';

interface StudyRegistrationFormPageProps extends NavPageLayoutProps {
  configStudyRegistrationForm: any;
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
