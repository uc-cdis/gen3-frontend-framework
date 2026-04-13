import React from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Code,
  Collapse,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconTool,
} from '@tabler/icons-react';
import type { KnownToolPart, ToolRendererProps } from '../types/chatbot.types';

// ─── State helpers ────────────────────────────────────────────────────────────

type ToolState = 'loading' | 'done' | 'error';

function getToolState(part: KnownToolPart): ToolState {
  if (part.state === 'input-available') return 'loading';
  if (part.state === 'output-available') return 'done';
  return 'error';
}

// Human-readable label from tool name.
// 'tool-geneQuery' → 'Gene Query'
function toolLabel(type: string): string {
  return type
    .replace(/^tool-/, '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

// ─── StateIcon ────────────────────────────────────────────────────────────────

function StateIcon({ state }: { state: ToolState }) {
  if (state === 'loading') {
    return <Loader size="xs" color="blue" />;
  }
  if (state === 'done') {
    return (
      <ThemeIcon size="xs" color="teal" variant="light" radius="xl">
        <IconCheck size={10} />
      </ThemeIcon>
    );
  }
  return (
    <ThemeIcon size="xs" color="red" variant="light" radius="xl">
      <IconAlertTriangle size={10} />
    </ThemeIcon>
  );
}

// ─── MantineToolRenderer ──────────────────────────────────────────────────────
//
// Renders a tool call card with three visual states:
//
//   input-available  → spinner + "Running…" label + collapsible input args
//   output-available → teal check + collapsible output details
//   output-error     → red warning + error message
//
// The card is compact by default; clicking the chevron reveals the raw
// input/output JSON. This keeps the chat clean while preserving debuggability.

const ToolRenderer = ({ part }: ToolRendererProps) => {
  const [detailsOpen, { toggle: toggleDetails }] = useDisclosure(false);
  const state = getToolState(part);
  const label = toolLabel(part.type);

  const hasDetails = !!(part.input || (state === 'done' && part.output));

  return (
    <Paper
      withBorder
      radius="md"
      px="sm"
      py="xs"
      my={4}
      style={{
        borderColor:
          state === 'loading'
            ? 'var(--mantine-color-blue-3)'
            : state === 'done'
              ? 'var(--mantine-color-teal-3)'
              : 'var(--mantine-color-red-3)',
        background:
          state === 'loading'
            ? 'var(--mantine-color-blue-0)'
            : state === 'done'
              ? 'var(--mantine-color-teal-0)'
              : 'var(--mantine-color-red-0)',
        width: '100%',
      }}
    >
      {/* ── Header row ──────────────────────────────────────────────────── */}
      <Group justify="space-between" gap="xs" wrap="nowrap">
        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
          {/* Tool icon */}
          <ThemeIcon
            size="sm"
            color={
              state === 'loading' ? 'blue' : state === 'done' ? 'teal' : 'red'
            }
            variant="light"
            radius="xl"
          >
            <IconTool size={12} />
          </ThemeIcon>

          {/* Tool name */}
          <Text size="xs" fw={600} c="dark.5" truncate>
            {label}
          </Text>

          {/* Status indicator */}
          <StateIcon state={state} />

          {/* Status badge */}
          <Badge
            size="xs"
            color={
              state === 'loading' ? 'blue' : state === 'done' ? 'teal' : 'red'
            }
            variant="light"
            radius="xl"
          >
            {state === 'loading'
              ? 'Running…'
              : state === 'done'
                ? 'Done'
                : 'Error'}
          </Badge>
        </Group>

        {/* Details toggle — only shown when there's something to expand */}
        {hasDetails && (
          <Tooltip
            label={detailsOpen ? 'Hide details' : 'Show details'}
            position="left"
            withArrow
          >
            <ActionIcon
              variant="subtle"
              color="gray"
              size="xs"
              onClick={toggleDetails}
              aria-label={
                detailsOpen ? 'Collapse tool details' : 'Expand tool details'
              }
            >
              {detailsOpen ? (
                <IconChevronUp size={12} />
              ) : (
                <IconChevronDown size={12} />
              )}
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      {/* ── Collapsible details ──────────────────────────────────────────── */}
      <Collapse in={detailsOpen}>
        <Stack gap="xs" mt="xs">
          {/* Input args */}
          {part.input && (
            <Stack gap={2}>
              <Text size="xs" c="dimmed" fw={500}>
                Input
              </Text>
              <Code
                block
                fz="xs"
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
              >
                {JSON.stringify(part.input, null, 2)}
              </Code>
            </Stack>
          )}

          {/* Output */}
          {state === 'done' && part.output && (
            <Stack gap={2}>
              <Text size="xs" c="dimmed" fw={500}>
                Output
              </Text>
              <Code
                block
                fz="xs"
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
              >
                {JSON.stringify(part.output, null, 2)}
              </Code>
            </Stack>
          )}

          {/* Error */}
          {state === 'error' && (
            <Alert
              color="red"
              variant="light"
              icon={<IconAlertTriangle size={14} />}
              p="xs"
            >
              <Text size="xs">
                {(part as any).errorText ?? 'Tool execution failed.'}
              </Text>
            </Alert>
          )}
        </Stack>
      </Collapse>
    </Paper>
  );
};

export default ToolRenderer;
