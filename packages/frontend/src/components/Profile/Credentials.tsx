
import React, { useEffect, useState } from 'react';
import { useCoreDispatch, showModal, Modals, useCoreSelector, selectCurrentModal, APIKey } from '@gen3/core';
import { Button, LoadingOverlay, Stack } from '@mantine/core';
import { CreateCredentialsAPIKeyModal } from '../Modals';
import { APICredentials } from './types';


import {
  useGetCredentialsQuery,
  useAddNewCredentialMutation,
  useGetCSRFQuery,
} from '@gen3/core';

import CredentialsTable from './CredentialsTable';

const Credentials = () => {
  const { data: csrfToken } = useGetCSRFQuery();
  const { isLoading } = useGetCredentialsQuery();
  const [addNewCredential, { isLoading: isNewLoading, isSuccess }] =
    useAddNewCredentialMutation();
  const modal = useCoreSelector((state) => selectCurrentModal(state));
  const [newCredential, setCredentials] = useState<APICredentials>({
    api_key: '', // pragma: allowlist-secret;
    key_id: '',
  });

  const coreDispatch = useCoreDispatch();
  return (
    <React.Fragment>
      {modal === Modals.CreateCredentialsAPIKeyModal && <CreateCredentialsAPIKeyModal openModal credentials={newCredential} />}
      <div className="flex flex-col w-full p-2 relative">
        <div className="flex mb-2">

          <Button
            color="accent.4"
            onClick={async () => {
              if (csrfToken) {
                await addNewCredential(csrfToken.csrfToken).unwrap().then((credentials) => {
                  coreDispatch(showModal({ modal: Modals.CreateCredentialsAPIKeyModal }));
                  setCredentials(credentials);
                });
            }}}
          >
            Create an API Key
          </Button>
        </div>
        <LoadingOverlay visible={isLoading || isNewLoading} />
        <CredentialsTable />
      </div>
    </React.Fragment>
  );
};

export default Credentials;
