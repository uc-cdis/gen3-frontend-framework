import React from 'react';
import { Stack, Text } from '@mantine/core';
import DataToolsPanel from '../../components/DataToolsPanel';
import { PanelHeaderStyle, PanelHeaderTextStyle, PanelStyle } from './styling';

const ToolsPanel = () => {
  return (
    <Stack gap="sm" className={PanelStyle}>
      <div className={PanelHeaderStyle}>
        <Text className={PanelHeaderTextStyle}>Tools</Text>
      </div>
      <DataToolsPanel />
    </Stack>
  );
};

export default ToolsPanel;
