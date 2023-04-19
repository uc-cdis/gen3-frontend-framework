import React from "react";
import { Button, Card, Stack } from "@mantine/core";
import { useSelector } from "react-redux";
import {
  useGetCredentialsQuery,
  useAddNewCredentialMutation,
  selectCSRFToken,
} from "@gen3/core";

const Credentials = () => {
  const csrfToken = useSelector(state => selectCSRFToken(state));
  const { data: credentials, isLoading } = useGetCredentialsQuery();
  console.log("csrfToken", csrfToken);
  const [addNewCredential, { isLoading: isNewLoading }] =
    useAddNewCredentialMutation(csrfToken);
  return (
    <React.Fragment>
      <Stack>
        {isLoading || isNewLoading ? (
          <Card>Loading...</Card>
        ) : (
          credentials?.jtis.map((c: any) => {
            <Card>
              <h3>{c.jti}</h3>
            </Card>;
          })
        )}
        <Button
          onClick={() => {
            addNewCredential();
          }}
        >
          Add
        </Button>
      </Stack>
    </React.Fragment>
  );
};

export default Credentials;
