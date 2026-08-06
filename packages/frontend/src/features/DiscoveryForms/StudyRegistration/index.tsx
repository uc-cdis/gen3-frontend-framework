import React from 'react';
import { Box, Text } from '@mantine/core';
import { NavPageLayoutProps } from '../../../features/Navigation';
import { useStudyRegistration } from './useStudyRegistration/useStudyRegistration';
import { FormContentViews } from './FormContentViews';

interface StudyRegistrationAccessRequestFormProps {
  configStudyRegistrationForm: any;
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
    data,
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
        <div className="mt-12 pt-4 border-t border-neutral-100 max-w-4xl mx-auto">
          <Text className="text-xs text-neutral-500 leading-relaxed">
            {configStudyRegistrationForm.disclaimer}
          </Text>
        </div>
      </Box>
    </div>
  );
};

export default StudyRegistrationAccessRequestForm;
