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

const CREDENTIALS_LOGIN_ERROR = 'Credentials Login Error';
const FORMAT_ERROR = 'Format Error';
const INVALID_JSON_MESSAGE = 'JSON is not valid';

interface CredentialsLoginProps {
  handleLogin: () => void;
}

/**
 * Reads the content of a given file and executes a callback with the file's text content.
 *
 * @param {File} file - The file to be read.
 * @param {function(string): void} callback - A callback function that is invoked with the file content as a string.
 */
const readFileContent = (file: File, callback: (content: string) => void) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    if (event.target?.result) callback(event.target.result as string);
  };
  reader.readAsText(file);
};

const CredentialsLogin = ({ handleLogin }: CredentialsLoginProps) => {
  const sessionContext = useContext(SessionContext);
  const [credentials, setCredentials] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { basePath } = useRouter();

  useEffect(() => {
    if (selectedFile) {
      readFileContent(selectedFile, setCredentials);
    }
  }, [selectedFile]);

  const handleCredentialsLogin = useCallback(
    async (credentials: string) => {
      setIsLoading(true);
      const updateSession = sessionContext?.updateSession ?? (() => null);
      const loginEndpoint = basePath
        ? `/${basePath}/api/auth/credentialsLogin`
        : '/api/auth/credentialsLogin';
      try {
        const parsedCredentials = JSON.parse(credentials);
        const response = await fetch(loginEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedCredentials),
        });

        if (!response.ok) {
          notifications.show({
            title: CREDENTIALS_LOGIN_ERROR,
            message: response.statusText,
          });
        } else {
          updateSession();
          handleLogin();
        }
      } catch (error) {
        if (error instanceof Error) {
          notifications.show({
            title: FORMAT_ERROR,
            message: INVALID_JSON_MESSAGE,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [handleLogin, sessionContext?.updateSession, basePath],
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
          onChange={(e) => setCredentials(e.target.value)}
          classNames={{ input: 'focus:border-2 focus:border-primary text-sm' }}
          size="sm"
          rightSection={
            credentials &&
            credentials.length > 0 && (
              <CloseIcon
                onClick={() => setCredentials('')}
                className="cursor-pointer"
                data-testid="search-input-clear-search"
              />
            )
          }
        />
        <FileButton onChange={setSelectedFile} accept="application/json">
          {(props) => <Button {...props}>Upload File</Button>}
        </FileButton>
        <Button
          color="primary.5"
          loading={isLoading}
          onClick={() => handleCredentialsLogin(credentials ?? '')}
          disabled={!credentials}
        >
          Authorize
        </Button>
      </Group>
    </Box>
  );
};

export default CredentialsLogin;
