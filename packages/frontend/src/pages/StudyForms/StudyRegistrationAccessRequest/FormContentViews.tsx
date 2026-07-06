import React from 'react';
import { FormOutcome } from './types';
import Form, {
  FormOnSubmitReturnProps,
  FormProps,
} from '../../../components/Content/Form';
import StudyRegistrationAccessRequestOutcome from './StudyRegistrationAccessRequestOutcome';
import { Center, Loader } from '@mantine/core';

interface FormContentViewsProps {
  formOutcome: FormOutcome;
  formError?: string;
  studyUID: string | null;
  formBody: FormProps['body'];
  config: any;
  onSubmit: (formValues: FormOnSubmitReturnProps) => Promise<void>;
  isLoading: boolean;
}

export const FormContentViews = ({
  formOutcome,
  formError,
  studyUID,
  formBody,
  config,
  onSubmit,
  isLoading,
}: FormContentViewsProps) => {
  console.log('formBody', formBody);
  console.log('config', config);
  if (isLoading) {
    return (
      <Center h="50vh">
        <Loader />
      </Center>
    );
  }
  if (formOutcome === FormOutcome.success) {
    return (
      <StudyRegistrationAccessRequestOutcome
        config={config[FormOutcome.success]}
      />
    );
  }
  if (formOutcome === FormOutcome.duplicateSubmission) {
    return (
      <StudyRegistrationAccessRequestOutcome
        config={config[FormOutcome.duplicateSubmission]}
      />
    );
  }
  return (
    <Form
      key={studyUID}
      className="*:mt-5 mb-5"
      body={formBody}
      showResetButton
      onSubmit={onSubmit}
      errorMessage={formError}
    />
  );
};
