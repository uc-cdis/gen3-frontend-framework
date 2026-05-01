import React, { useCallback } from 'react';
import { Button, Card, Group, Stack, Text, Tooltip } from '@mantine/core';
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
    <Card withBorder radius="md" className="sm:w-1/5 md:w-1/4 lg:w-1/3">
      <Card.Section inheritPadding py="xs">
        <Stack align="left">
          <Text
            ta="left"
            classNames={{ root: 'font-header' }}
            size="md"
            fw={500}
            lineClamp={3}
          >
            {tier}
          </Text>
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
          {features.map((feature: string) => (
            <Text key={feature} ta="left" size="xs" c="base-contrast.4">
              {feature}
            </Text>
          ))}
        </Stack>
      </Card.Section>
      <div className="flex mx-8 justify-center border-1 border-base"></div>
      <Group className="mt-2 p-2" justify="center">
        <Tooltip label={tooltip}>
          <Button
            aria-label={`Select ${buttonLabel}`}
            variant="subtle"
            leftSection={<Icon icon="gen3:right_arrow" size={12} />}
            onClick={handleClick}
          >
            {buttonLabel}
          </Button>
        </Tooltip>
      </Group>
    </Card>
  );
};

export default WorkspaceTierCard;
