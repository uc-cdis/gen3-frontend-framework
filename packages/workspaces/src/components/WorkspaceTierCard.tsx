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

export interface WorkspaceTierCardProps extends Omit<
  WorkspaceCardConfig,
  'tierConfiguration'
> {
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

  const icon = (
    <span className="mb-[0.75em]">
      <Icon icon="gen3:right-arrow" width="24" height="24" />
    </span>
  );
  return (
    <Card
      withBorder
      radius="md"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
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
        <Stack justify="left">
          <Text fw={600} c="base-contrast.4">
            {label}
          </Text>
          <Text c="base-contrast.4" size="xs">
            {description}
          </Text>
        </Stack>
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
      <Card.Section
        withBorder
        inheritPadding
        py="sm"
        style={{ marginTop: 'auto' }}
      >
        <Group justify="center">
          <Tooltip label={tooltip}>
            <Button
              aria-label={`Select ${buttonLabel}`}
              variant="subtle"
              rightSection={icon}
              onClick={handleClick}
            >
              <Text tt="uppercase">{buttonLabel}</Text>
            </Button>
          </Tooltip>
        </Group>
      </Card.Section>
    </Card>
  );
};

export default WorkspaceTierCard;
