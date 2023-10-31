import React from 'react';
import { Button, LoadingOverlay, Stack } from '@mantine/core';

import {
  useGetCredentialsQuery,
  useAddNewCredentialMutation,
  useGetCSRFQuery,
} from '@gen3/core';

import CredentialsTable from './CredentialsTable';

const Credentials = () => {
  const { data: csrfToken } = useGetCSRFQuery();
  const { isLoading } = useGetCredentialsQuery();
  const [addNewCredential, { isLoading: isNewLoading }] =
    useAddNewCredentialMutation();

  return (
    <React.Fragment>
      <Stack className="w-full p-2">
        <LoadingOverlay visible={isLoading || isNewLoading} />
        <div className="flex">
          <Button
            color="accent.4"
            onClick={() => {
              if (csrfToken) addNewCredential(csrfToken.csrfToken);
            }}
          >
            Create an API Key
          </Button>
        </div>

          <CredentialsTable />
      </Stack>
    </React.Fragment>
  );
};

export default Credentials;
