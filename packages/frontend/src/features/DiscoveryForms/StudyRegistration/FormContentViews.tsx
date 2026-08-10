import React from 'react';
import {
  FormOutcome,
  studyRegistrationAccessRequestFormOutcomeProps,
} from './types';
import Form, {
  FormOnSubmitReturnProps,
  FormProps,
} from '../../../components/Content/Form';
import StudyRegistrationAccessRequestOutcome from './StudyRegistrationAccessRequestOutcome';
import { Center, Loader } from '@mantine/core';
import { StudyRegistrationFormConfig } from '../../../pages/StudyForms/StudyRegistration/types';

interface FormContentViewsProps {
  formOutcome: FormOutcome;
  formError?: string;
  studyUID: string | null;
  formBody: FormProps['body'];
  config: StudyRegistrationFormConfig;
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
        outcomeConfig={
          config[
            FormOutcome.success
          ] as studyRegistrationAccessRequestFormOutcomeProps
        }
      />
    );
  }
  if (formOutcome === FormOutcome.error) {
    return (
      <div className="[&>div]:flex-col">
        <StudyRegistrationAccessRequestOutcome
          outcomeConfig={
            config[
              FormOutcome.error
            ] as studyRegistrationAccessRequestFormOutcomeProps
          }
        />
        <div className="mt-6">
          <div className="max-w-lg m-auto text-center">
            {formError ? (
              <>
                <strong>Form Error:</strong>
                <div>{formError}</div>
              </>
            ) : (
              `No form error information available.`
            )}
          </div>
        </div>
      </div>
    );
  }
  return (
    <Form
      key={studyUID}
      className="*:mt-5 mb-5 max-w-lg"
      body={formBody}
      showResetButton
      onSubmit={onSubmit}
      errorMessage={formError}
    />
  );
};
