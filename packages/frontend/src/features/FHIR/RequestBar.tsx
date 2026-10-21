import React, { type ReactElement } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  CopyButton,
  Paper,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { FiSend } from 'react-icons/fi';
import { MdCheck, MdContentCopy } from 'react-icons/md';

interface RequestBarProps {
  url: string;
  onSend?: () => void;
  loading?: boolean;
}

// The URL is a read-only preview. The tab and param rows are what drive it.
// GET is a static badge because the proxy is read-only.
const RequestBar = ({
  url,
  onSend,
  loading = false,
}: RequestBarProps): ReactElement => (
  <Paper
    withBorder
    radius="md"
    shadow="xs"
    p="sm"
    className="flex items-center gap-3"
  >
    <Badge size="xl" radius="xl" className="bg-emerald-500">
      GET
    </Badge>
    <TextInput
      readOnly
      size="md"
      value={url}
      aria-label="Request URL"
      className="flex-1"
      classNames={{ input: 'font-mono' }}
    />
    <CopyButton value={url}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? 'Copied' : 'Copy URL'} withArrow>
          <ActionIcon
            variant="subtle"
            color={copied ? 'green' : 'gray'}
            size="lg"
            onClick={copy}
            aria-label="Copy URL"
          >
            {copied ? <MdCheck /> : <MdContentCopy />}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
    <Button
      size="md"
      leftSection={<FiSend />}
      onClick={onSend}
      disabled={!onSend}
      loading={loading}
    >
      Send
    </Button>
  </Paper>
);

export default RequestBar;
