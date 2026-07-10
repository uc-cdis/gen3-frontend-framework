// StudyRegistrationAccessRequestForm.tsx
import React from 'react';
import { Box, Text } from '@mantine/core';
import { NavPageLayoutProps } from '../../../features/Navigation';
import { useStudyRegistrationForm } from './useStudyRegistrationForm';
import { FormContentViews } from '../../../features/DiscoveryForms/StudyRegistrationAccessRequest/FormContentViews';

interface StudyRegistrationAccessRequestFormProps {
  configStudyRegistrationRequestAccessForm: any;
}

const StudyRegistrationForm = ({ configStudyRegistrationForm }: any) => {
  console.log('configStudyRegistrationForm', configStudyRegistrationForm);
  // Get everything needed from Hook
  const {
    formOutcome,
    formError,
    studyUID,
    formBody,
    formOnSubmit,
    isLoading,
  } = useStudyRegistrationForm(configStudyRegistrationForm);
  return (
    <div className="flex justify-items-center w-full">
      <Box className="w-full bg-white rounded-md m-8 p-8 ">
        <div className="max-w-4xl mx-auto">
          <FormContentViews
            formOutcome={formOutcome}
            formError={formError}
            studyUID={studyUID}
            formBody={formBody}
            config={configStudyRegistrationForm}
            onSubmit={formOnSubmit}
            isLoading={isLoading}
          />
        </div>
      </Box>
    </div>
  );
};

export default StudyRegistrationForm;
