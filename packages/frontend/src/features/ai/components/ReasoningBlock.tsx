import React, { useEffect, useState } from 'react';
import {
  Accordion,
  Badge,
  Box,
  Group,
  Loader,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconBrain } from '@tabler/icons-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReasoningBlockProps {
  /** The reasoning/thinking text — may grow while streaming */
  content: string;
  /**
   * Whether reasoning is currently being streamed.
   * When true: accordion auto-opens and shows a live indicator.
   * When false: accordion collapses by default (user can expand).
   */
  isStreaming: boolean;
  /** Optional label override. Default: "Reasoning" */
  label?: string;
}

// ─── ReasoningBlock ───────────────────────────────────────────────────────────
// Uses Mantine Accordion with controlled state so we can:
//   - Auto-open while reasoning is streaming
//   - Auto-close when reasoning finishes (user can re-open)
//
// The `keepMounted` prop keeps the DOM node alive so the content doesn't
// disappear mid-stream when the panel collapses.

const ReasoningBlock = ({
  content,
  isStreaming,
  label = 'Reasoning',
}: ReasoningBlockProps) => {
  const [value, setValue] = useState<string | null>(
    // Open by default while streaming, collapsed once done
    isStreaming ? 'reasoning' : null,
  );

  // Track previous streaming state to auto-collapse when it finishes
  useEffect(() => {
    if (isStreaming) {
      setValue('reasoning'); // auto-open when streaming starts
    } else {
      setValue(null); // auto-collapse when streaming ends
    }
  }, [isStreaming]);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <Accordion
      value={value}
      onChange={setValue}
      variant="contained"
      radius="md"
      mb="xs"
      styles={{
        control: {
          paddingTop: '6px',
          paddingBottom: '6px',
          paddingLeft: '12px',
          paddingRight: '12px',
          backgroundColor: 'var(--mantine-color-violet-0)',
          '&:hover': {
            backgroundColor: 'var(--mantine-color-violet-1)',
          },
        },
        panel: {
          paddingTop: 0,
        },
        content: {
          paddingTop: '8px',
          paddingBottom: '8px',
          paddingLeft: '12px',
          paddingRight: '12px',
        },
        item: {
          border: '1px solid var(--mantine-color-violet-2)',
          backgroundColor: 'var(--mantine-color-violet-0)',
        },
      }}
      // Keep panel mounted so streaming content isn't lost on collapse
      // enable in mantine v9
      // keepMounted={true}
    >
      <Accordion.Item value="reasoning">
        <Accordion.Control>
          <Group gap="xs" wrap="nowrap">
            <ThemeIcon size="xs" color="violet" variant="light" radius="xl">
              <IconBrain size={12} />
            </ThemeIcon>
            <Text size="xs" fw={500} c="violet.7">
              {label}
            </Text>
            {isStreaming ? (
              <Loader size="xs" color="violet" type="dots" />
            ) : (
              <Badge size="xs" color="violet" variant="light" radius="xl">
                {wordCount} words
              </Badge>
            )}
          </Group>
        </Accordion.Control>

        <Accordion.Panel>
          <Box
            style={{
              borderLeft: '2px solid var(--mantine-color-violet-3)',
              paddingLeft: '10px',
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            <Text
              size="xs"
              c="dimmed"
              style={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                fontFamily: 'var(--mantine-font-family-monospace)',
              }}
            >
              {content}
              {isStreaming && (
                <span
                  style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '12px',
                    background: 'var(--mantine-color-violet-5)',
                    marginLeft: '2px',
                    verticalAlign: 'text-bottom',
                    animation: 'blink 1s step-end infinite',
                  }}
                />
              )}
            </Text>
          </Box>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default ReasoningBlock;
