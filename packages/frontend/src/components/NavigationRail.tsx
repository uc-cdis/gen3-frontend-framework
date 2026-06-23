import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import {
  ActionIcon,
  Box,
  Collapse,
  Group,
  Paper,
  Stack,
  Tabs,
  Text,
  Tooltip,
} from '@mantine/core';

import { Icon } from '@iconify-icon/react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

export type NavRailItem = {
  label: string;
  tooltip?: string;
  icon: string | ReactElement;
  component: ReactElement;
};

interface NormalizedNavRailItem extends NavRailItem {
  value: string;
  IconComponent?: ReactElement;
}

type CollapsibleNavRailProps = {
  items: NavRailItem[];
  defaultValue?: string;
  width?: number;
  collapsedWidth?: number;
};

export const NavigationRail = ({
  items,
  defaultValue,
  width = 280,
  collapsedWidth = 64,
}: CollapsibleNavRailProps) => {
  const initialValue = defaultValue ?? items[0]?.label ?? null;

  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>(initialValue);

  const normalizedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        value: item.label,
        IconComponent:
          typeof item.icon === 'string' ? (
            <Icon icon={item.icon} width={24} height={24} />
          ) : (
            item.icon
          ),
      })),
    [items],
  );

  const handleCollapsedIconClick = (value: string) => {
    setActiveTab(value);
    setExpanded(true);
  };

  return (
    <Paper
      withBorder
      h="100%"
      style={{
        display: 'flex',
        width: expanded ? width : collapsedWidth,
        transition: 'width 160ms ease',
        overflow: 'hidden',
      }}
    >
      {!expanded && (
        <Stack align="center" gap="xs" py="md" px="xs" w={collapsedWidth}>
          <ActionIcon
            variant="subtle"
            aria-label="Expand navigation"
            onClick={() => setExpanded(true)}
          >
            <IconChevronRight size={18} />
          </ActionIcon>

          {normalizedItems.map(
            ({ value, label, IconComponent }: NormalizedNavRailItem) => {
              const selected = activeTab === value;

              return (
                <Tooltip key={value} label={label} position="right">
                  <ActionIcon
                    aria-label={label}
                    variant={selected ? 'filled' : 'subtle'}
                    onClick={() => handleCollapsedIconClick(value)}
                  >
                    {IconComponent ? (
                      IconComponent
                    ) : (
                      <Text size="xs">{label[0]}</Text>
                    )}
                  </ActionIcon>
                </Tooltip>
              );
            },
          )}
        </Stack>
      )}

      <Collapse
        expanded={expanded}
        orientation="horizontal"
        transitionDuration={160}
      >
        <Box w={width}>
          <Group justify="space-between" px="sm" py="xs">
            <Text fw={600} size="sm">
              Navigation
            </Text>

            <ActionIcon
              variant="subtle"
              aria-label="Collapse navigation"
              onClick={() => setExpanded(false)}
            >
              <IconChevronLeft size={18} />
            </ActionIcon>
          </Group>

          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            orientation="horizontal"
            keepMounted
          >
            <Tabs.List>
              {normalizedItems.map(({ value, label, IconComponent }) => (
                <Tabs.Tab
                  key={value}
                  value={value}
                  leftSection={IconComponent ?? undefined}
                >
                  {label}
                </Tabs.Tab>
              ))}
            </Tabs.List>

            {normalizedItems.map(({ value, component }) => (
              <Tabs.Panel key={value} value={value} p="md">
                {component}
              </Tabs.Panel>
            ))}
          </Tabs>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default NavigationRail;
