import React from 'react';
import { ActionIcon, Badge, Group, Stack, Text } from '@mantine/core';
import { Icon } from '@iconify-icon/react';

const WorkspaceToolbar = () => {
  return (
    <div className="flex items-center px-4 border-b-2 border-base-lighter pb-4 mb-2">
      <ActionIcon
        variant="outline"
        radius="xl"
        size="lg"
        aria-label="Back to workspace list"
        color="primary.5"
        className="mr-4"
      >
        <Icon icon="gen3:back-arrow" width="100%" height="100%" />
      </ActionIcon>
      <Stack gap="-10px">
        <Text size="xl" c="primary.4">
          Workspace Name
        </Text>
        <Group>
          <Text size="sm">Workspace Description</Text>
          <Badge>Free</Badge>
        </Group>
      </Stack>
    </div>
  );
};

export default WorkspaceToolbar;
