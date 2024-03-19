import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  FileButton,
  Group,
  Loader,
  Textarea,
} from '@mantine/core';
import {
  setAccessToken,
  useAuthorizeFromCredentialsMutation,
  useCoreDispatch,
} from '@gen3/core';
import { notifications } from '@mantine/notifications';
import { MdClose as CloseIcon } from 'react-icons/md';
import { useDeepCompareEffect } from 'use-deep-compare';
import { LoginRedirectProps } from './types';

const CredentialsLogin = ({
  handleLoginSelected,
  redirectURL,
}: LoginRedirectProps) => {
  const dispatch = useCoreDispatch();

  const [credentials, setCredentials] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [authorizeFromCredentials, { data, isError, isLoading, isSuccess }] =
    useAuthorizeFromCredentialsMutation();

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setCredentials(event.target.result as string);
      };
      reader.readAsText(file);
    }
  }, [file]);

  useDeepCompareEffect(() => {
     if (isSuccess && data?.access_token) {
      fetch('/api/auth/setSessionToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: data.access_token }),
      });

      dispatch(setAccessToken({ accessToken: data?.access_token }));
      handleLoginSelected('/', redirectURL);

    } else {
      if (isError) {
        notifications.show({
          title: 'Authorization Error',
          message: 'Invalid Credentials',
        });
      }
    }
  }, [data, isError, isSuccess, handleLoginSelected, redirectURL, dispatch]);

  return (
    <Box className="flex flex-col items-center justify-center my-2">
      <Divider
        color="black"
        size="md"
        label="Authorize with Credentials"
        labelPosition="center"
      />
      <Group>
        <Textarea
          value={credentials ?? ''}
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
            ) : (
              credentials &&
              credentials?.length > 0 && (
                <CloseIcon
                  onClick={() => {
                    setCredentials('');
                  }}
                  className="cursor-pointer"
                  data-testid="search-input-clear-search"
                />
              )
            )
          }
        ></Textarea>
        <FileButton onChange={setFile} accept="application/json">
          {(props) => <Button {...props}>...</Button>}
        </FileButton>
        <Button
          color="blue"
          onClick={async () => {
            try {
              const json = await JSON.parse(credentials ?? '{}');
              authorizeFromCredentials(json);

            } catch (e) {
              notifications.show({
                title: 'Format Error',
                message: 'JSON is not valid',
              });
            }
          }}
          disabled={credentials === null || credentials === ''}
        >
          Authorize
        </Button>
      </Group>
    </Box>
  );
};

export default CredentialsLogin;
