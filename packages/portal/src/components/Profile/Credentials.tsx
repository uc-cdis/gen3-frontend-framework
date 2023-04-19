import React from "react";
import { Button, Card, Stack } from "@mantine/core";

import {
  useGetCredentialsQuery,
  useAddNewCredentialMutation,
  selectCSRFToken,
  useCoreSelector
} from "@gen3/core";

const Credentials = () => {
  const csrfToken = useCoreSelector(selectCSRFToken);
  const { data: credentials, isLoading } = useGetCredentialsQuery();
  const [addNewCredential, { isLoading: isNewLoading }] =
    useAddNewCredentialMutation();
  return (
    <React.Fragment>
      <Stack>
        {isLoading  ? (
          <Card>Loading...</Card>
        ) : (
          credentials?.map((c: any) => {
            return (
            <Card key={c.jti}>
              <h3>{c.jti}</h3>
            </Card>
          )
          })
        )}
        <Button
          onClick={() => {
            addNewCredential(csrfToken);
          }}
        >
          Add
        </Button>
      </Stack>
    </React.Fragment>
  );
};

export default Credentials;
