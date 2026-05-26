import React, { useCallback } from 'react';
import {
  Badge,
  Button,
  Card,
  Group,
  List,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { Icon } from '@iconify-icon/react';
import { WorkspaceCardConfig } from './types';
import { type WorkspaceTier } from '../types';

export interface WorkspaceTierCardProps extends WorkspaceCardConfig {
  onSelectTier: (tier: WorkspaceTier) => void;
}

const WorkspaceTierCard = ({
  label,
  description,
  tier,
  features = [],
  tooltip = 'Launch workspace',
  buttonLabel = 'Launch',
  onSelectTier,
}: WorkspaceTierCardProps) => {
  const handleClick = useCallback(
    () => onSelectTier(tier),
    [onSelectTier, tier],
  );
  return (
    <Card withBorder radius="md">
      <Card.Section inheritPadding py="sm">
        <Stack align="left">
          <Badge
            classNames={{
              root: 'font-header',
            }}
            color="var(--mantine-primary-color-1)"
            size="lg"
            fw={500}
          >
            {tier}
          </Badge>
        </Stack>
      </Card.Section>
      <Card.Section inheritPadding py="xs">
        <Group justify="left">
          <Text fw={600} c="base-contrast.4">
            {label}
          </Text>
          <Text c="base-contrast.4" size="xs">
            {description}
          </Text>
        </Group>
      </Card.Section>
      <Card.Section inheritPadding py="xs">
        <Stack align="left">
          <List size="sm" listStyleType="disc">
            {features.map((feature: string) => (
              <List.Item key={feature}>{feature}</List.Item>
            ))}
          </List>
        </Stack>
      </Card.Section>
      <Group className="mt-2 p-2" justify="center">
        <Tooltip label={tooltip}>
          <Button
            aria-label={`Select ${buttonLabel}`}
            variant="subtle"
            rightSection={<Icon icon="gen3:right_arrow" size={12} />}
            onClick={handleClick}
          >
            <Text tt="uppercase">{buttonLabel}</Text>
          </Button>
        </Tooltip>
      </Group>
    </Card>
  );
};

export default WorkspaceTierCard;
