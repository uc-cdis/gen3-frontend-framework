import React from "react";
import { Button, Card, Stack } from "@mantine/core";

import {
  useGetCredentialsQuery,
  useAddNewCredentialMutation,
  selectCSRFToken,
  useCoreSelector,
  CoreState,
} from "@gen3/core";

import CredentialsTable from "@/components/Profile/CredentialsTable";

const Credentials = () => {
  const csrfToken = useCoreSelector((state : CoreState) => selectCSRFToken(state))
  const { isLoading } = useGetCredentialsQuery();
  const [addNewCredential, { isLoading: isNewLoading }] =
    useAddNewCredentialMutation();

  return (
    <React.Fragment>
      <Stack className="w-1/2 p-2">
        {isLoading || isNewLoading ? (
          <Card>Loading...</Card>
        ) : (
          <CredentialsTable />
        )}
        <div className="flex justify-center">
          <Button
            onClick={() => {
              if (csrfToken) addNewCredential(csrfToken);
            }}
          >
            Add Credentials
          </Button>
        </div>
      </Stack>
    </React.Fragment>
  );
};

export default Credentials;
