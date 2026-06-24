import React, {
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import PanelErrorBoundary from './PanelErrorBoundary';

const TRANSITION_DURATION = 200;

export type NavigationRailItem = {
  label: string;
  tooltip?: string;
  icon: string | ReactElement;
  panel: ReactElement;
};

interface NormalizedNavRailItem extends NavigationRailItem {
  value: string;
  IconComponent?: ReactElement;
}

type CollapsibleNavRailProps = {
  items: NavigationRailItem[];
  label?: string;
  defaultValue?: string;
  width?: number;
  collapsedWidth?: number;
  isExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
};

export const NavigationRail = ({
  items,
  label,
  defaultValue,
  width = 280,
  collapsedWidth = 64,
  isExpanded = true,
  onExpandChange = () => {},
}: CollapsibleNavRailProps) => {
  const initialValue = defaultValue ?? items[0]?.label ?? null;

  const [expanded, setExpanded] = useState(isExpanded);
  const [showCollapsedIcons, setShowCollapsedIcons] = useState(!isExpanded);
  const [activeTab, setActiveTab] = useState<string | null>(initialValue);
  const prevIsExpanded = useRef(isExpanded);

  const applyExpand = (expand: boolean) => {
    setExpanded(expand);
    if (expand) {
      setShowCollapsedIcons(false);
    } else {
      setTimeout(() => setShowCollapsedIcons(true), TRANSITION_DURATION);
    }
  };

  useEffect(() => {
    if (prevIsExpanded.current !== isExpanded) {
      prevIsExpanded.current = isExpanded;
      applyExpand(isExpanded);
    }
  }, [isExpanded]);

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
    applyExpand(true);
    onExpandChange?.(true);
  };

  return (
    <Paper
      withBorder
      h="100%"
      style={{
        display: 'flex',
        width: expanded ? width : collapsedWidth,
        transition: `width ${TRANSITION_DURATION}ms ease`,
        overflow: 'hidden',
      }}
    >
      {showCollapsedIcons && (
        <Stack align="center" gap="xs" py="md" px="xs" w={collapsedWidth}>
          <ActionIcon
            variant="subtle"
            aria-label="Expand navigation"
            onClick={() => {
              applyExpand(true);
              onExpandChange?.(true);
            }}
          >
            <Icon icon="gen3:left-panel-open" width={24} height={24} />
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
        transitionDuration={TRANSITION_DURATION}
      >
        <Box w={width}>
          <Group justify="space-between" px="sm" py="xs">
            <Text fw={600} size="sm">
              {label}
            </Text>

            <ActionIcon
              variant="subtle"
              aria-label="Collapse navigation"
              onClick={() => {
                applyExpand(false);
                onExpandChange?.(false);
              }}
            >
              <Icon icon="gen3:left-panel-open" width={24} height={24} />
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
            <PanelErrorBoundary>
              {normalizedItems.map(({ value, panel }) => (
                <Tabs.Panel key={value} value={value} p="md">
                  {panel}
                </Tabs.Panel>
              ))}
            </PanelErrorBoundary>
          </Tabs>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default NavigationRail;
