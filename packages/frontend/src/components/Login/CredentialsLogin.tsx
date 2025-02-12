import React, { useContext, useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  FileButton,
  Group,
  Text,
  Textarea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { MdClose as CloseIcon } from 'react-icons/md';
import { SessionContext } from '../../lib/session/session';
import { useRouter } from 'next/router';

interface CredentialsLoginProps {
  handleLogin: () => void;
}

const CredentialsLogin = ({ handleLogin }: CredentialsLoginProps) => {
  const sessionContext = useContext(SessionContext);
  const [credentials, setCredentials] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isCredentialsPending, setIsCredentialsPending] = useState(false);

  const { basePath } = useRouter();

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setCredentials(event.target.result as string);
      };
      reader.readAsText(file);
    }
  }, [file]);

  const handleCredentialsLogin = useCallback(
    async (credentials: string) => {
      setIsCredentialsPending(true);
      const updateSession = sessionContext?.updateSession ?? (() => null);
      try {
        //     setIsCredentialsPending(true);
        const json = await JSON.parse(credentials);

        await fetch(
          basePath
            ? `/${basePath}/api/auth/credentialsLogin`
            : '/api/auth/credentialsLogin',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(json),
          },
        );
        updateSession();
        handleLogin();
      } catch (e) {
        notifications.show({
          title: 'Format Error',
          message: 'JSON is not valid',
        });
      } finally {
        setIsCredentialsPending(false); // Set loading to false once fetch is done (success or fail)
      }
    },
    [handleLogin, sessionContext?.updateSession],
  );

  return (
    <Box className="flex flex-col items-center justify-center my-2">
      <Divider
        color="black"
        size="md"
        className="w-1/3"
        label={
          <Text size="md" c="primary.4">
            Authorize with credentials
          </Text>
        }
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
          }
        ></Textarea>
        <FileButton onChange={setFile} accept="application/json">
          {(props) => <Button {...props}>...</Button>}
        </FileButton>
        <Button
          color="primary.5"
          loading={isCredentialsPending}
          onClick={async () => {
            await handleCredentialsLogin(credentials ?? '');
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
