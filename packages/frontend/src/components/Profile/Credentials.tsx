import React from 'react';
import { Button, Card, Stack } from '@mantine/core';

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
        <div className="flex">
          <Button color="accent.4"
            onClick={() => {
              if (csrfToken) addNewCredential(csrfToken.csrfToken);
            }}
          >
            Create an API Key
          </Button>
        </div>
        {isLoading || isNewLoading ? (
          <Card>Loading...</Card>
        ) : (
          <CredentialsTable />
        )}

      </Stack>
    </React.Fragment>
  );
};

export default Credentials;
