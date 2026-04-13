import React from 'react';
import { Avatar, Box, Group, Paper, Stack, Text } from '@mantine/core';
import { IconRobot, IconUser } from '@tabler/icons-react';
import type { UIMessage } from '@ai-sdk/react';
import { StreamingMarkdown } from './StreamingMarkdown';
import ReasoningBlock from './ReasoningBlock';
import { default as DefaultToolRenderer } from './ToolRenderer';
import { useChatContext } from '../context/ChatContext';
import type { KnownToolPart, ToolRendererProps } from '../types'; // ─── Types ────────────────────────────────────────────────────────────────────

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MantineMessageRendererProps {
  message: UIMessage;
  /**
   * Injected by ChatShell from config.slots.ToolRenderer.
   * Rendered inline at the tool part's actual index in message.parts,
   * so tools appear between reasoning and text exactly as emitted —
   * not appended after the bubble.
   */
  ToolRenderer?: React.ComponentType<ToolRendererProps>;
}

// ─── Segment types ────────────────────────────────────────────────────────────
// We do one pass over message.parts and group into:
//   BubbleSegment — consecutive non-tool parts rendered inside a Paper
//   ToolSegment   — a single tool part rendered as a card outside Paper

type BubbleSegment = {
  kind: 'bubble';
  parts: { part: UIMessage['parts'][number]; index: number }[];
};
type ToolSegment = {
  kind: 'tool';
  part: KnownToolPart;
  index: number;
};
type Segment = BubbleSegment | ToolSegment;

function buildSegments(parts: UIMessage['parts']): Segment[] {
  return parts.reduce<Segment[]>((acc, part, i) => {
    if (part.type.startsWith('tool-')) {
      acc.push({ kind: 'tool', part: part as KnownToolPart, index: i });
    } else {
      const last = acc[acc.length - 1];
      if (last?.kind === 'bubble') {
        last.parts.push({ part, index: i });
      } else {
        acc.push({ kind: 'bubble', parts: [{ part, index: i }] });
      }
    }
    return acc;
  }, []);
}

// ─── Part sub-renderers ───────────────────────────────────────────────────────

function TextPart({
  text,
  isStreaming,
  isUser,
}: {
  text: string;
  isStreaming: boolean;
  isUser: boolean;
}) {
  if (isUser) {
    return (
      <Text size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
        {text}
      </Text>
    );
  }
  return <StreamingMarkdown content={text} isStreaming={isStreaming} />;
}

function ReasoningPart({
  reasoning,
  isStreaming,
}: {
  reasoning: string;
  isStreaming: boolean;
}) {
  return (
    <ReasoningBlock
      content={reasoning}
      isStreaming={isStreaming}
      label="Reasoning"
    />
  );
}

// ─── MantineMessageRenderer ───────────────────────────────────────────────────
//
// Single ordered pass over message.parts — the AI SDK preserves the model's
// emission order, which for a reasoning model with tool calls looks like:
//
//   { type: 'reasoning', ... }
//   { type: 'tool-geneQuery', state: 'input-available', ... }
//   { type: 'tool-geneQuery', state: 'output-available', ... }
//   { type: 'text', text: '...' }
//
// We segment consecutive non-tool parts into Paper bubbles, and let tool
// parts break out as cards at their exact position. This produces:
//
//   [ReasoningBlock]   ← inside first Paper
//   [ToolCard]         ← outside Paper, at natural index
//   [text bubble]      ← inside second Paper

const MantineMessageRenderer = ({
  message,
  ToolRenderer = DefaultToolRenderer,
}: MantineMessageRendererProps) => {
  const {
    status,
    config: {
      features: { toolRendering },
    },
  } = useChatContext();

  const isUser = message.role === 'user';
  const isStreaming =
    !isUser && (status === 'streaming' || status === 'submitted');
  const segments = buildSegments(message.parts);

  return (
    <Group
      align="flex-start"
      justify={isUser ? 'flex-end' : 'flex-start'}
      gap="xs"
      mb="sm"
      wrap="nowrap"
    >
      {/* Assistant avatar — left */}
      {!isUser && (
        <Avatar size="sm" color="blue" variant="light" radius="xl" mt={2}>
          <IconRobot size={14} />
        </Avatar>
      )}

      <Stack
        gap="xs"
        style={{ maxWidth: '78%', minWidth: 0 }}
        align={isUser ? 'flex-end' : 'flex-start'}
      >
        <Text size="xs" c="dimmed" fw={500}>
          {isUser ? 'You' : 'Assistant'}
        </Text>

        {segments.map((segment) => {
          // ── Tool card — outside bubble, at its natural position ──────────
          if (segment.kind === 'tool' && toolRendering) {
            return (
              <ToolRenderer
                key={`tool-${segment.index}`}
                part={segment.part}
                messageId={message.id}
              />
            );
          }

          // ── Bubble — wraps consecutive non-tool parts ────────────────────
          const visibleParts = segment.parts.filter(({ part }) => {
            if (part.type === 'text') return (part as any).text?.length > 0;
            if (part.type === 'reasoning')
              return (part as any).reasoning?.length > 0;
            if (part.type === 'file') return true;
            return false;
          });
          console.log('visibleParts', visibleParts);
          if (visibleParts.length === 0) return null;

          return (
            <Paper
              key={`bubble-${segment.parts[0].index}`}
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
                borderBottomRightRadius: isUser ? '4px' : undefined,
                borderBottomLeftRadius: !isUser ? '4px' : undefined,
                width: '100%',
              }}
            >
              {visibleParts.map(({ part, index }) => {
                if (part.type === 'text') {
                  return (
                    <TextPart
                      key={index}
                      text={(part as any).text}
                      isStreaming={isStreaming}
                      isUser={isUser}
                    />
                  );
                }
                if (part.type === 'reasoning') {
                  return (
                    <ReasoningPart
                      key={index}
                      reasoning={(part as any).reasoning ?? ''}
                      isStreaming={isStreaming}
                    />
                  );
                }
                if (
                  part.type === 'file' &&
                  (part as any).mediaType?.startsWith('image/')
                ) {
                  return (
                    <Box key={index} mt="xs">
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
          );
        })}
      </Stack>

      {/* User avatar — right */}
      {isUser && (
        <Avatar size="sm" color="gray" variant="light" radius="xl" mt={2}>
          <IconUser size={14} />
        </Avatar>
      )}
    </Group>
  );
};

export default MantineMessageRenderer;
