// GenericRegistrationAccessRequestForm.tsx
import React from 'react';
import { Box, Text } from '@mantine/core';
import { useGenericRegistration } from '../../../features/DiscoveryForms/GenericRegistrationAccessRequest/useGenericRegistration';
import { FormContentViews } from '../../../features/DiscoveryForms/GenericRegistrationAccessRequest/FormContentViews';
import type { GenericRegistrationAccessRequestFormConfig } from './types';

interface GenericRegistrationAccessRequestFormProps {
  config: GenericRegistrationAccessRequestFormConfig;
}

const GenericRegistrationAccessRequestForm = ({
  config,
}: GenericRegistrationAccessRequestFormProps) => {
  const {
    formOutcome,
    formError,
    studyUID,
    formBody,
    formOnSubmit,
    isLoading,
  } = useGenericRegistration(config);
  return (
    <div className="flex justify-items-center w-full">
      <Box className="w-full bg-white rounded-md m-8 p-8 ">
        <div className="max-w-4xl mx-auto">
          <FormContentViews
            formOutcome={formOutcome}
            formError={formError}
            studyUID={studyUID}
            formBody={formBody}
            config={config}
            onSubmit={formOnSubmit}
            isLoading={isLoading}
          />
        </div>
        <div className="mt-12 pt-4 border-t border-neutral-100 max-w-4xl mx-auto">
          <Text className="text-xs text-neutral-500 leading-relaxed">
            {config.disclaimer}
          </Text>
        </div>
      </Box>
    </div>
  );
};

export default GenericRegistrationAccessRequestForm;
