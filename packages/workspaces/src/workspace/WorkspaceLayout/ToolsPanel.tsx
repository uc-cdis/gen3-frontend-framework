import React from 'react';
import { Stack, Text } from '@mantine/core';
import DataToolsPanel from '../../components/DataToolsPanel';

const ToolsPanel = () => {
  return (
    <Stack gap="xs" className="p-4">
      <Text size="lg">Tools</Text>
      <DataToolsPanel />
    </Stack>
  );
};

export default ToolsPanel;
