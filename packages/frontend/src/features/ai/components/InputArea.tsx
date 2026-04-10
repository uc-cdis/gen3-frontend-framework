import React, { useEffect, useRef, useState } from 'react';
import {
  ActionIcon,
  Group,
  Paper,
  Text,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { IconArrowUp, IconPlayerStop } from '@tabler/icons-react';
import { useChatContext } from '../context/ChatContext';
import type { InputAreaProps } from '../types';

// ─── MantineInputArea ─────────────────────────────────────────────────────────
// Uses Mantine Textarea with auto-grow, submit on Enter (Shift+Enter = newline),
// and a stop button that appears when streaming.

const InputArea = ({ onSend, disabled, placeholder }: InputAreaProps) => {
  const [value, setValue] = useState('');
  const { status, stop } = useChatContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isStreaming = status === 'streaming' || status === 'submitted';
  const canSubmit = value.trim().length > 0 && !disabled;

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Re-focus after a response completes so user can immediately type next msg
  useEffect(() => {
    if (status === 'ready') {
      textareaRef.current?.focus();
    }
  }, [status]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    if (!canSubmit) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <Paper
      p="sm"
      style={{
        borderTop: '1px solid var(--mantine-color-gray-2)',
        borderRadius: 0,
      }}
    >
      <Group align="flex-end" gap="xs" wrap="nowrap">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? 'Message… (Shift+Enter for newline)'}
          disabled={disabled}
          autosize
          minRows={1}
          maxRows={6}
          flex={1}
          styles={{
            input: {
              borderRadius: '12px',
              paddingRight: '12px',
              resize: 'none',
            },
          }}
        />

        {/* Stop button while streaming; Send button otherwise */}
        {isStreaming ? (
          <Tooltip label="Stop generating" position="top">
            <ActionIcon
              size="lg"
              radius="xl"
              color="red"
              variant="light"
              onClick={stop}
              aria-label="Stop"
            >
              <IconPlayerStop size={16} />
            </ActionIcon>
          </Tooltip>
        ) : (
          <Tooltip label="Send (Enter)" position="top">
            <ActionIcon
              size="lg"
              radius="xl"
              color="blue"
              variant={canSubmit ? 'filled' : 'light'}
              disabled={!canSubmit}
              onClick={submit}
              aria-label="Send message"
            >
              <IconArrowUp size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      {/* Hint text */}
      <Text size="xs" c="dimmed" mt={4} ta="center">
        Shift + Enter for a new line
      </Text>
    </Paper>
  );
};

export default InputArea;
