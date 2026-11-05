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
  tierLabel = undefined,
  features = [],
  tooltip = 'Launch workspace',
  buttonLabel = 'Launch',
  onSelectTier,
  baseColor,
}: WorkspaceTierCardProps) => {
  const handleClick = useCallback(
    () => onSelectTier(tier),
    [onSelectTier, tier],
  );

  const icon = (
    <span className="mb-0.5">
      <Icon icon="gen3:right-arrow" width="24" height="24" />
    </span>
  );

  return (
    <Card
      withBorder
      radius="sm"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: baseColor ?? 'var(--mantine-color-base-lighter)',
      }}
    >
      <Card.Section inheritPadding py="sm">
        <Stack align="left">
          <Badge
            classNames={{
              root: 'font-header',
            }}
            color="primary.4"
            size="lg"
            fw={500}
          >
            {tierLabel ?? (tier === 'remote' ? 'paid' : 'free')}
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
