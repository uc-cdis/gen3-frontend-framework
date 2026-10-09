import React, { type ReactElement, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Button,
  Code,
  CopyButton,
  Divider,
  Group,
  LoadingOverlay,
  Modal,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconCheck,
  IconCopy,
  IconDownload,
  IconEye,
  IconEyeOff,
  IconKey,
} from '@tabler/icons-react';
import type { APICredentials } from '../Profile/types';
import { saveToFile } from './CreateCredentialsAPIKeyModal';

const COPY_TIMEOUT = 2000;

interface ApiKeyCreatedModalProps {
  opened: boolean;
  onClose: () => void;
  credentials: APICredentials;
}

const FieldLabel = ({ children }: { children: string }): ReactElement => (
  <Text size="xs" fw={600} c="dimmed" tt="uppercase" className="tracking-wider">
    {children}
  </Text>
);

/**
 * Modal shown after a new API key has been created. The key is only shown once,
 * so the user can reveal, copy, or download it before closing.
 * @param opened - whether the modal is shown
 * @param onClose - called when the modal is closed
 * @param credentials - the newly created fence credential
 */
export const ApiKeyCreatedModal = ({
  opened,
  onClose,
  credentials,
}: ApiKeyCreatedModalProps): ReactElement => {
  const [revealed, setRevealed] = useState(false);

  const maskedKey = '•'.repeat(40) + '...' + credentials.api_key.slice(-6);

  const handleClose = () => {
    setRevealed(false);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="50vw"
      radius="sm"
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      overlayProps={{ backgroundOpacity: 0.45, blur: 3 }}
      closeButtonProps={{ 'aria-label': 'Close modal' }}
      title={
        <Group gap="sm">
          <ThemeIcon color="accent.2" variant="light" size={36} radius="sm">
            <IconKey size={24} />
          </ThemeIcon>
          <Title order={2} size="h4" fw={600}>
            API key created
          </Title>
        </Group>
      }
    >
      <LoadingOverlay visible={credentials.api_key === ''} />
      <Stack gap="lg">
        <Alert
          color="utility.2"
          variant="light"
          icon={<IconAlertTriangle size={24} className="text-primary" />}
          classNames={{
            message: 'text-md text-utility-warn-contrast',
          }}
        >
          This key is only shown once. Please copy or save it and store it in a
          safe place.
        </Alert>

        <Stack gap={6}>
          <FieldLabel>Key ID</FieldLabel>
          <Group gap="xs" wrap="nowrap">
            <Code className="flex-1 truncate px-2.5 py-1.5 text-sm">
              {credentials.key_id}
            </Code>
            <CopyButton value={credentials.key_id} timeout={COPY_TIMEOUT}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy Key ID'} withArrow>
                  <ActionIcon
                    color={copied ? 'green' : 'gray'}
                    variant="light"
                    size="lg"
                    onClick={copy}
                    aria-label="Copy Key ID"
                    data-testid="button-create-api-key-copy-id"
                  >
                    {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
        </Stack>

        <Stack gap={6}>
          <Group justify="space-between">
            <FieldLabel>API Key</FieldLabel>
            <UnstyledButton
              onClick={() => setRevealed((r) => !r)}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-base_contrast hover:bg-base-light hover:text-base-contrast-darker"
              data-testid="button-create-api-key-reveal"
            >
              {revealed ? <IconEyeOff size={14} /> : <IconEye size={14} />}
              <span>{revealed ? 'Hide' : 'Reveal'}</span>
            </UnstyledButton>
          </Group>
          <ScrollArea.Autosize mah={90} type="auto">
            <Code block className="whitespace-pre-wrap break-all text-[12.5px]">
              {revealed ? credentials.api_key : maskedKey}
            </Code>
          </ScrollArea.Autosize>
        </Stack>

        <Divider />

        <Group justify="space-between">
          <Button
            variant="default"
            onClick={handleClose}
            data-testid="button-create-api-key-close"
          >
            Close
          </Button>
          <Group gap="xs">
            <Button
              variant="light"
              color="base.2"
              leftSection={<IconDownload size={15} />}
              onClick={() =>
                saveToFile(JSON.stringify(credentials), 'credentials.json')
              }
              data-testid="button-create-api-key-download"
            >
              Download
            </Button>
            <CopyButton
              value={JSON.stringify(credentials)}
              timeout={COPY_TIMEOUT}
            >
              {({ copied, copy }) => (
                <Button
                  color={copied ? 'green' : 'blue'}
                  leftSection={
                    copied ? <IconCheck size={15} /> : <IconCopy size={15} />
                  }
                  onClick={copy}
                  data-testid="button-create-api-key-copy"
                >
                  {copied ? 'Copied' : 'Copy key'}
                </Button>
              )}
            </CopyButton>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ApiKeyCreatedModal;
