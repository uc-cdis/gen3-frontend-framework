import React from 'react';
import { Stack, Text } from '@mantine/core';
import DataToolsPanel from '../../components/DataToolsPanel';
import { PanelHeaderStyle, PanelHeaderTextStyle, PanelStyle } from './styling';

const ToolsPanel = () => {
  return (
    <Stack gap="sm" classNames={{ root: PanelStyle }}>
      <div className={PanelHeaderStyle}>
        <Text className={PanelHeaderTextStyle}>Data and Tools</Text>
      </div>
      <DataToolsPanel />
    </Stack>
  );
};

export default ToolsPanel;
