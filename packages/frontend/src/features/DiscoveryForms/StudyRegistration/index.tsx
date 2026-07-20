// StudyRegistrationAccessRequestForm.tsx
import React from 'react';
import { Box, Text } from '@mantine/core';
import { NavPageLayoutProps } from '../../../features/Navigation';
import { useStudyRegistrationForm } from './useStudyRegistrationForm';
import { FormContentViews } from './FormContentViews';

interface StudyRegistrationAccessRequestFormProps {
  configStudyRegistrationRequestAccessForm: any;
}

const StudyRegistrationForm = ({ configStudyRegistrationForm }: any) => {
  console.log('configStudyRegistrationForm', configStudyRegistrationForm);
  // Get everything needed from Hook
  const { formOutcome, formError, formBody, formOnSubmit, isLoading } =
    useStudyRegistrationForm(configStudyRegistrationForm);
  console.log('formOnSubmit', formOnSubmit);
  return (
    <div className="flex justify-items-center w-full">
      <Box className="w-full bg-white rounded-md m-8 p-8 ">
        <div className="max-w-4xl mx-auto">
          <button type="button" onClick={() => formOnSubmit({} as any)}>
            Force Test Submit
          </button>
          <FormContentViews
            studyUID={'123'}
            formOutcome={formOutcome}
            formError={formError}
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
