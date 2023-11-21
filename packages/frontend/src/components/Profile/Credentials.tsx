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
      <div className="flex flex-col w-full p-2">

        <div className="flex">
          <LoadingOverlay visible={isLoading || isNewLoading} />
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
      </div>
    </React.Fragment>
  );
};

export default Credentials;
