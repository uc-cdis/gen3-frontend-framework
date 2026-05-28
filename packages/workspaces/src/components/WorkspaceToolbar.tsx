import React from 'react';
import { ActionIcon, Badge, Group, Stack, Text } from '@mantine/core';
import { Icon } from '@iconify-icon/react';
import { WorkspaceTier } from '../types';
import { WorkspaceTierInformation } from '../workspace/Tiers/types';

interface WorkspaceToolbarProps {
  tierInformation: WorkspaceTierInformation;
  setTier: (tier: WorkspaceTier | null) => void;
}

const WorkspaceToolbar = ({
  tierInformation,
  setTier,
}: WorkspaceToolbarProps) => {
  const returnToWorkspaceSelection = () => {
    setTier(null);
  };

  return (
    <div className="flex items-center px-4 border-b-2 border-base-lighter pb-4 mb-2">
      <ActionIcon
        variant="outline"
        radius="xl"
        size="lg"
        aria-label="Back to workspace list"
        color="primary.5"
        className="mr-4"
        onClick={returnToWorkspaceSelection}
      >
        <Icon icon="gen3:back-arrow" width="100%" height="100%" />
      </ActionIcon>
      <Stack gap="-10px">
        <Text size="xl" c="primary.4">
          {tierInformation.label}
        </Text>
        <Group>
          <Text size="sm">{tierInformation.description}</Text>
          <Badge>{tierInformation.type as string}</Badge>
        </Group>
      </Stack>
    </div>
  );
};

export default WorkspaceToolbar;
