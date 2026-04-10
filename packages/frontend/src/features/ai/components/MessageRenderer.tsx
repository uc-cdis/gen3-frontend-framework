import React from 'react';
import {
  Avatar,
  Box,
  Group,
  Paper,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { IconRobot, IconUser } from '@tabler/icons-react';
import type { UIMessage } from '@ai-sdk/react';
import { StreamingMarkdown } from './StreamingMarkdown';
import ReasoningBlock from './ReasoningBlock';
import { useChatContext } from '../context/ChatContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MessageRendererProps {
  message: UIMessage;
}

// ─── Part Renderers ───────────────────────────────────────────────────────────

interface TextPartProps {
  text: string;
  isStreaming: boolean;
  isUser: boolean;
}

function TextPart({ text, isStreaming, isUser }: TextPartProps) {
  if (isUser) {
    // User messages: plain text, no markdown parsing needed
    return (
      <Text size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
        {text}
      </Text>
    );
  }

  return <StreamingMarkdown content={text} isStreaming={isStreaming} />;
}

interface ReasoningPartProps {
  // AI SDK v5 reasoning part shape: { type: 'reasoning', reasoning: string }
  reasoning: string;
  isStreaming: boolean;
}

function ReasoningPart({ reasoning, isStreaming }: ReasoningPartProps) {
  return (
    <ReasoningBlock
      content={reasoning}
      isStreaming={isStreaming}
      label="Reasoning"
    />
  );
}

// ─── MessageRenderer ───────────────────────────────────────────────────

const MessageRenderer = ({ message }: MessageRendererProps) => {
  const { status } = useChatContext();
  const theme = useMantineTheme();

  const isUser = message.role === 'user';
  // Only the last assistant message can be actively streaming
  const isStreaming =
    !isUser && (status === 'streaming' || status === 'submitted');

  return (
    <Group
      align="flex-start"
      justify={isUser ? 'flex-end' : 'flex-start'}
      gap="xs"
      mb="sm"
      wrap="nowrap"
    >
      {/* Avatar — left for assistant, right for user */}
      {!isUser && (
        <Avatar size="sm" color="blue" variant="light" radius="xl" mt={2}>
          <IconRobot size={14} />
        </Avatar>
      )}

      <Stack
        gap={4}
        style={{ maxWidth: '78%', minWidth: 0 }}
        align={isUser ? 'flex-end' : 'flex-start'}
      >
        {/* Role label */}
        <Text size="xs" c="dimmed" fw={500}>
          {isUser ? 'You' : 'Assistant'}
        </Text>

        {/* Message bubble */}
        <Paper
          px="md"
          py="sm"
          radius="lg"
          style={{
            background: isUser
              ? 'var(--mantine-color-blue-6)'
              : 'var(--mantine-color-gray-1)',
            color: isUser
              ? 'var(--mantine-color-white)'
              : 'var(--mantine-color-dark-7)',
            // Round the "anchor" corner differently for each side
            borderBottomRightRadius: isUser ? '4px' : undefined,
            borderBottomLeftRadius: !isUser ? '4px' : undefined,
            width: '100%',
          }}
        >
          {message.parts.map((part, i) => {
            // ── Text part ────────────────────────────────────────────────────
            if (part.type === 'text') {
              return (
                <TextPart
                  key={i}
                  text={part.text}
                  isStreaming={isStreaming}
                  isUser={isUser}
                />
              );
            }

            // ── Reasoning part (extended thinking) ───────────────────────────
            // AI SDK surfaces this as { type: 'reasoning', reasoning: string }
            if (part.type === 'reasoning') {
              return (
                <ReasoningPart
                  key={i}
                  reasoning={(part as any).reasoning ?? ''}
                  isStreaming={isStreaming}
                />
              );
            }

            // ── Tool call parts ───────────────────────────────────────────────
            // These are handled by the ToolRenderer slot in MessageWithTools,
            // which is called from ChatShell — skip them here to avoid double render.
            if (part.type.startsWith('tool-')) {
              return null;
            }

            // ── File / image parts ────────────────────────────────────────────
            if (
              part.type === 'file' &&
              (part as any).mediaType?.startsWith('image/')
            ) {
              return (
                <Box key={i} mt="xs">
                  <img
                    src={(part as any).url}
                    alt="Attached image"
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                  />
                </Box>
              );
            }

            return null;
          })}
        </Paper>
      </Stack>

      {/* User avatar — right side */}
      {isUser && (
        <Avatar size="sm" color="gray" variant="light" radius="xl" mt={2}>
          <IconUser size={14} />
        </Avatar>
      )}
    </Group>
  );
};

export default MessageRenderer;
