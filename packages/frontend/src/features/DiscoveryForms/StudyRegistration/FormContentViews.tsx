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
  console.log('formOutcome', formOutcome);
  console.log('formError', formError);
  console.log('studyUID', studyUID);
  console.log('formBody', formBody);
  console.log('config', config);
  console.log('onSubmit', onSubmit);
  console.log('isLoading', isLoading);

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
  if (formOutcome === FormOutcome.error) {
    return (
      <div className="[&>div]:flex-col">
        <StudyRegistrationAccessRequestOutcome
          config={config[FormOutcome.error]}
        />
        <div className="mt-6">
          <div className="max-w-lg m-auto text-center">
            {formError ? (
              <>
                <strong>Form Error:</strong>
                <div>{formError}</div>
              </>
            ) : (
              `No Form Error information available.`
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
