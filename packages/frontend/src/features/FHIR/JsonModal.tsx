import React, { type ReactElement } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Code,
  CopyButton,
  Modal,
  ScrollArea,
  Tooltip,
} from '@mantine/core';
import { MdCheck, MdContentCopy } from 'react-icons/md';

export interface JsonView {
  title: string;
  json: string;
  // The exact request, for the full response
  url?: string;
}

interface JsonModalProps {
  view?: JsonView;
  opened: boolean;
  onClose: () => void;
}

// Plain text on purpose: a full page is ~22k lines, too many to highlight, and
// find still works. React escapes it, so HTML in the data never runs.
const JsonModal = ({ view, opened, onClose }: JsonModalProps): ReactElement => {
  const json = view?.json ?? '';

  return (
    <Modal opened={opened} onClose={onClose} title={view?.title} size="xl">
      {view?.url && (
        <div className="mb-3 flex items-center gap-2">
          <Badge size="sm" radius="xl" className="bg-emerald-500">
            GET
          </Badge>
          <Code className="flex-1 truncate">{view.url}</Code>
          <CopyButton value={view.url}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? 'Copied' : 'Copy URL'} withArrow>
                <ActionIcon
                  variant="subtle"
                  color={copied ? 'green' : 'gray'}
                  onClick={copy}
                  aria-label="Copy request URL"
                >
                  {copied ? <MdCheck /> : <MdContentCopy />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </div>
      )}
      <div className="mb-2 flex justify-end">
        <CopyButton value={json}>
          {({ copied, copy }) => (
            <Button
              size="xs"
              variant="default"
              leftSection={copied ? <MdCheck /> : <MdContentCopy />}
              onClick={copy}
            >
              {copied ? 'Copied' : 'Copy JSON'}
            </Button>
          )}
        </CopyButton>
      </div>
      <ScrollArea.Autosize mah="70vh">
        <Code block>{json}</Code>
      </ScrollArea.Autosize>
    </Modal>
  );
};

export default JsonModal;
