// StudyRegistrationAccessRequestForm.tsx
import React from 'react';
import { Box, Text } from '@mantine/core';
import {
  NavPageLayout,
  NavPageLayoutProps,
} from '../../../features/Navigation';
import { useStudyRegistration } from '../../../features/DiscoveryForms/StudyRegistrationAccessRequest/useStudyRegistration';
import { FormContentViews } from '../../../features/DiscoveryForms/StudyRegistrationAccessRequest/FormContentViews';
import StudyRegistrationForm from '../../../features/DiscoveryForms/StudyRegistration';

interface StudyRegistrationAccessRequestFormPageProps extends NavPageLayoutProps {
  configStudyRegistrationRequestAccessForm: any;
  studyName: string;
}

const StudyRegistrationPage = ({
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
      <StudyRegistrationForm
        configStudyRegistrationRequestAccessForm={
          configStudyRegistrationRequestAccessForm
        }
      />
    </NavPageLayout>
  );
};

export default StudyRegistrationPage;
