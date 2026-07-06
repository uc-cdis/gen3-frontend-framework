// StudyRegistrationAccessRequestForm.tsx
import React from 'react';
import { Box, Text } from '@mantine/core';
import { NavPageLayoutProps } from '../../../features/Navigation';
import { useStudyRegistration } from '../../../features/DiscoveryForms/StudyRegistrationAccessRequest/useStudyRegistration';
import { FormContentViews } from '../../../features/DiscoveryForms/StudyRegistrationAccessRequest/FormContentViews';

interface StudyRegistrationAccessRequestFormProps {
  configStudyRegistrationRequestAccessForm: any;
}

const StudyRegistrationAccessRequestForm = ({
  configStudyRegistrationRequestAccessForm,
}: StudyRegistrationAccessRequestFormProps) => {
  // Get everything needed from Hook
  const {
    formOutcome,
    formError,
    studyUID,
    formBody,
    formOnSubmit,
    isLoading,
  } = useStudyRegistration(configStudyRegistrationRequestAccessForm);
  return (
    <div className="flex justify-items-center w-full">
      <Box className="w-full bg-white rounded-md m-8 p-8 ">
        <div className="max-w-4xl mx-auto">
          <FormContentViews
            formOutcome={formOutcome}
            formError={formError}
            studyUID={studyUID}
            formBody={formBody}
            config={configStudyRegistrationRequestAccessForm}
            onSubmit={formOnSubmit}
            isLoading={isLoading}
          />
        </div>
        <div className="mt-12 pt-4 border-t border-neutral-100 max-w-4xl mx-auto">
          <Text className="text-xs text-neutral-500 leading-relaxed">
            {configStudyRegistrationRequestAccessForm.disclaimer}
          </Text>
        </div>
      </Box>
    </div>
  );
};

export default StudyRegistrationAccessRequestForm;
