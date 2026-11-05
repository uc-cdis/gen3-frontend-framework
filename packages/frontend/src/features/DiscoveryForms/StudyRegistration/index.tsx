import React from 'react';
import { Box } from '@mantine/core';
import { useStudyRegistration } from './useStudyRegistration/useStudyRegistration';
import { FormContentViews } from './FormContentViews';
import type { StudyRegistrationFormConfig } from '../../../pages/StudyForms/StudyRegistration/types';

interface StudyRegistrationAccessRequestFormProps {
  configStudyRegistrationForm: StudyRegistrationFormConfig;
}

const StudyRegistrationAccessRequestForm = ({
  configStudyRegistrationForm,
}: StudyRegistrationAccessRequestFormProps) => {
  // Get everything needed from Hook
  const {
    formOutcome,
    formError,
    studyUID,
    formBody,
    formOnSubmit,
    isLoading,
  } = useStudyRegistration(configStudyRegistrationForm);

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

export default StudyRegistrationAccessRequestForm;
