import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  FileButton,
  Group,
  Text,
  Title,
} from '@mantine/core';
import { MdClose as CloseIcon } from 'react-icons/md';
import { SessionContext } from '../../lib/session/session';
import { useRouter } from 'next/router';

const CREDENTIALS_LOGIN_ERROR = 'Credentials Login Error';
const FORMAT_ERROR = 'Format Error';
const INVALID_JSON_MESSAGE = 'JSON is not valid';
const FILE_READ_ERROR_MESSAGE =
  'The selected file could not be read. Please choose a different file.';
const NOT_JSON_FILE_MESSAGE =
  'The selected file is not a JSON file. Please choose a .json credentials file.';

interface CredentialsLoginProps {
  handleLogin: () => void;
}

/**
 * Reads the content of a given file and executes a callback with the file's text content.
 *
 * @param {File} file - The file to be read.
 * @param {function(string): void} callback - A callback function that is invoked with the file content as a string.
 * @param {function(): void} onError - Invoked if the file cannot be read.
 * @returns A cleanup function that cancels the read.
 */
const readFileContent = (
  file: File,
  callback: (content: string) => void,
  onError: () => void,
): (() => void) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    if (typeof event.target?.result === 'string') {
      callback(event.target.result);
    } else {
      onError();
    }
  };
  reader.onerror = onError;
  reader.readAsText(file);
  return () => {
    reader.onload = null;
    reader.onerror = null;
    if (reader.readyState === FileReader.LOADING) reader.abort();
  };
};

const isJsonFile = (file: File) =>
  file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');

const CredentialsLogin = ({ handleLogin }: CredentialsLoginProps) => {
  const sessionContext = useContext(SessionContext);
  const [credentials, setCredentials] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { basePath } = useRouter();
  const resetRef = useRef<() => void>(null);
  const uploadRef = useRef<HTMLButtonElement>(null);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setCredentials(null);
    setError(null);
    resetRef.current?.();
    // the clear button unmounts, so return focus to a stable control
    uploadRef.current?.focus();
  }, []);

  const handleFileChange = useCallback((file: File | null) => {
    setCredentials(null);
    if (file && !isJsonFile(file)) {
      setSelectedFile(null);
      setError(NOT_JSON_FILE_MESSAGE);
      resetRef.current?.();
      return;
    }
    setError(null);
    setSelectedFile(file);
  }, []);

  useEffect(() => {
    if (!selectedFile) return undefined;
    return readFileContent(
      selectedFile,
      (content) => {
        try {
          JSON.parse(content);
          setCredentials(content);
        } catch {
          setCredentials(null);
          setError(INVALID_JSON_MESSAGE);
        }
      },
      () => {
        setCredentials(null);
        setError(FILE_READ_ERROR_MESSAGE);
      },
    );
  }, [selectedFile]);

  const handleCredentialsLogin = useCallback(
    async (credentials: string) => {
      setIsLoading(true);
      setError(null);
      const updateSession = sessionContext?.updateSession ?? (() => null);
      // router.basePath is '' when unset and already leading-slashed when set
      const loginEndpoint = `${basePath}/api/auth/credentialsLogin`;
      try {
        const parsedCredentials = JSON.parse(credentials);
        const response = await fetch(loginEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...parsedCredentials,
            setAsAccessToken: true,
          }),
        });

        if (!response.ok) {
          const message = response.statusText || CREDENTIALS_LOGIN_ERROR;
          setError(`${CREDENTIALS_LOGIN_ERROR}: ${message}`);
        } else {
          updateSession();
          handleLogin();
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(`${FORMAT_ERROR}: ${INVALID_JSON_MESSAGE}`);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [handleLogin, sessionContext?.updateSession, basePath],
  );

  const loginDisabled = !credentials;

  return (
    <Box
      component="section"
      aria-labelledby="credentials-login-heading"
      className="flex flex-col items-center justify-center my-2"
    >
      <Divider
        color="black"
        size="md"
        classNames={{ root: 'w-1/3 m-4' }}
        label={
          <Title
            order={3}
            size="md"
            fw={400}
            lh={1}
            m={0}
            c="primary.4"
            id="credentials-login-heading"
          >
            Authorize with credentials
          </Title>
        }
        labelPosition="center"
      />
      <Group>
        <Group>
          <Text
            component="output"
            size="sm"
            fw={500}
            aria-label="Credentials file"
          >
            {selectedFile ? selectedFile.name : 'No credentials loaded'}
          </Text>
          {selectedFile && (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="md"
              aria-label={`Clear loaded credentials file ${selectedFile.name}`}
              onClick={handleClear}
            >
              <CloseIcon aria-hidden="true" />
            </ActionIcon>
          )}
        </Group>
        <FileButton
          resetRef={resetRef}
          onChange={handleFileChange}
          accept="application/json,.json"
        >
          {(props) => (
            <Button {...props} ref={uploadRef}>
              Upload File
            </Button>
          )}
        </FileButton>
        <Button
          color="primary.5"
          loading={isLoading}
          aria-busy={isLoading}
          aria-disabled={loginDisabled || undefined}
          data-disabled={loginDisabled || undefined}
          aria-describedby="credentials-login-hint"
          onClick={() => {
            if (loginDisabled) return;
            void handleCredentialsLogin(credentials);
          }}
        >
          Login
        </Button>
      </Group>
      <Text id="credentials-login-hint" size="xs" c="dimmed" mt="xs">
        Upload a JSON credentials file (.json) to enable login.
      </Text>
      <div role="alert" className="min-h-[1.0rem]">
        {error && (
          <Text size="sm" c="utility.3">
            {error}
          </Text>
        )}
      </div>
    </Box>
  );
};

export default CredentialsLogin;
