import React from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconMessage,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import type { SessionThread } from './types';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ThreadPanelProps {
  threads: SessionThread[];
  activeThreadId: string | null;
  panelOpen: boolean;
  onSelectThread: (id: string) => void;
  onNewThread: () => void;
  onDeleteThread: (id: string) => void;
  onTogglePanel: () => void;
}

// ─── ThreadItem ───────────────────────────────────────────────────────────────

function ThreadItem({
  thread,
  isActive,
  onSelect,
  onDelete,
}: {
  thread: SessionThread;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <Box style={{ position: 'relative' }} className="thread-item">
      <NavLink
        active={isActive}
        onClick={onSelect}
        label={
          <Text size="sm" fw={isActive ? 600 : 400} truncate>
            {thread.title}
          </Text>
        }
        description={
          thread.preview ? (
            <Text size="xs" c="dimmed" lineClamp={1} mt={2}>
              {thread.preview}
            </Text>
          ) : undefined
        }
        leftSection={
          <ThemeIcon
            size="sm"
            color={isActive ? 'blue' : 'gray'}
            variant={isActive ? 'light' : 'subtle'}
            radius="xl"
          >
            <IconMessage size={12} />
          </ThemeIcon>
        }
        rightSection={
          <Tooltip label="Delete" position="right" withArrow>
            <ActionIcon
              size="xs"
              color="red"
              variant="subtle"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label={`Delete: ${thread.title}`}
              style={{ opacity: 0, transition: 'opacity 150ms' }}
              className="thread-delete-btn"
            >
              <IconTrash size={12} />
            </ActionIcon>
          </Tooltip>
        }
        styles={{
          root: {
            borderRadius: '8px',
            paddingTop: '8px',
            paddingBottom: '8px',
            '&:hover .thread-delete-btn': { opacity: 1 },
          },
        }}
      />
    </Box>
  );
}

// ─── ThreadPanel ──────────────────────────────────────────────────────────────
const ThreadPanel = ({
  threads,
  activeThreadId,
  panelOpen,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  onTogglePanel,
}: ThreadPanelProps) => {
  return (
    <>
      {/* Inline style for hover-reveal delete button */}
      <style>{`
        .thread-item:hover .thread-delete-btn { opacity: 1 !important; }
      `}</style>

      <Stack
        gap={0}
        style={{
          width: panelOpen ? '260px' : '0px',
          minWidth: panelOpen ? '260px' : '0px',
          overflow: 'hidden',
          transition: 'width 200ms ease, min-width 200ms ease',
          borderRight: '1px solid var(--mantine-color-gray-2)',
          background: 'var(--mantine-color-gray-0)',
          height: '100%',
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <Group
          justify="space-between"
          px="sm"
          py="xs"
          style={{
            borderBottom: '1px solid var(--mantine-color-gray-2)',
            flexShrink: 0,
          }}
        >
          <Text size="sm" fw={600} c="dimmed">
            Conversations
          </Text>
          <Tooltip label="Close panel" position="right">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={onTogglePanel}
              aria-label="Close history panel"
            >
              <IconChevronLeft size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/* New conversation button */}
        <Box px="sm" py="xs" style={{ flexShrink: 0 }}>
          <Button
            leftSection={<IconPlus size={14} />}
            variant={activeThreadId === null ? 'light' : 'subtle'}
            color="blue"
            size="xs"
            fullWidth
            onClick={onNewThread}
          >
            New conversation
          </Button>
        </Box>

        {/* Thread list */}
        <ScrollArea flex={1} px="xs">
          <Stack gap={2} pb="sm">
            {threads.length === 0 ? (
              <Text size="xs" c="dimmed" ta="center" py="xl">
                No conversations yet
              </Text>
            ) : (
              threads.map((thread) => (
                <ThreadItem
                  key={thread.id}
                  thread={thread}
                  isActive={thread.id === activeThreadId}
                  onSelect={() => onSelectThread(thread.id)}
                  onDelete={() => onDeleteThread(thread.id)}
                />
              ))
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </>
  );
};

export default ThreadPanel;
