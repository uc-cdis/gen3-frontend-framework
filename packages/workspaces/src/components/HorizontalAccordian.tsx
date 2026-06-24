import type { ReactNode } from 'react';
import React from 'react';
import { ActionIcon, Box, Group, Paper, Text } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

const TRANSITION_MS = 250;

type HorizontalAccordionProps = {
  label: ReactNode;
  expand: boolean;
  onExpanded: (expanded: boolean) => void;
  children: ReactNode;

  expandedWidth?: number | string;
  collapsedWidth?: number | string;
};

export function HorizontalAccordion({
  label,
  expand,
  onExpanded,
  children,
  expandedWidth = 360,
  collapsedWidth = 48,
}: HorizontalAccordionProps) {
  return (
    <Paper
      withBorder
      radius="md"
      style={{
        width: expand ? expandedWidth : collapsedWidth,
        transition: `width ${TRANSITION_MS}ms ease`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Group
        justify="space-between"
        wrap="nowrap"
        gap="xs"
        px="xs"
        py="xs"
        style={{
          minWidth: collapsedWidth,
        }}
      >
        <Box
          style={{
            opacity: expand ? 1 : 0,
            width: expand ? 'auto' : 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            transition: `
              opacity ${TRANSITION_MS}ms ease,
              width ${TRANSITION_MS}ms ease
            `,
          }}
        >
          <Text fw={600} size="sm">
            {label}
          </Text>
        </Box>

        <ActionIcon
          variant="subtle"
          aria-label={expand ? 'Collapse panel' : 'Expand panel'}
          onClick={() => onExpanded(!expand)}
          style={{
            flexShrink: 0,
          }}
        >
          {expand ? (
            <IconChevronLeft size={18} />
          ) : (
            <IconChevronRight size={18} />
          )}
        </ActionIcon>
      </Group>

      <Box
        px="xs"
        pb="xs"
        style={{
          opacity: expand ? 1 : 0,
          pointerEvents: expand ? 'auto' : 'none',
          transition: `opacity ${TRANSITION_MS}ms ease`,
          minWidth:
            typeof expandedWidth === 'number' ? expandedWidth - 24 : undefined,
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}

export default HorizontalAccordion;
