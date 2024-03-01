import React, {useState} from 'react';
import { Button, Loader, TextInput } from '@mantine/core';
import { GEN3_DOMAIN, setAccessToken, useAuthorizeFromCredentialsMutation, useCoreDispatch } from '@gen3/core';
import { MdClose as CloseIcon } from 'react-icons/md';
import { useDeepCompareEffect } from 'use-deep-compare';
import { useRouter } from 'next/router';
import { showNotification } from '@mantine/notifications';
import { stripTrailingSlash } from '../../utils';
import { LoginRedirectProps } from './types';

const CredentialsLogin = ( {  handleLoginSelected, redirectURL } : LoginRedirectProps) => {

  const dispatch = useCoreDispatch();

  const [credentials, setCredentials] = useState('');

  const [authorizeFromCredentials, { data, isError, isLoading }] = useAuthorizeFromCredentialsMutation();

  useDeepCompareEffect( () => {
    if (data?.access_token) {
       fetch('/api/auth/setSessionToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: data.access_token })
      });

      dispatch(setAccessToken({ accessToken: data?.access_token }));
      handleLoginSelected('', redirectURL);
    }}, [data]);

  return (
    <div className='flex  w-full'>
      <TextInput         value={credentials}
                         onChange={(event) => {
                           setCredentials(event.target.value);
                         }}

                         classNames={{
                           input: 'focus:border-2 focus:border-primary text-sm',
                         }}
                         size="sm"
                         rightSection={
                           isLoading ? (
                             <Loader size={20} />
                             ) :
                           credentials.length > 0 && (
                             <CloseIcon
                               onClick={() => {
                                 setCredentials('');
                               }}
                               className="cursor-pointer"
                               data-testid="search-input-clear-search"
                             />
                           )
                         }
      ></TextInput>
      <Button color="blue" onClick={() => {
            const payload = {
          "api_key": "",
            "key_id": ""
            };
          authorizeFromCredentials(payload);
      }}>Authorize</Button>
    </div>
  );
};

export default CredentialsLogin;
