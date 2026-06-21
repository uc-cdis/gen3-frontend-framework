import React from 'react';
import { Text } from '@mantine/core';
import DataToolsPanel from '../../components/DataToolsPanel';
import { PanelHeaderStyle, PanelHeaderTextStyle } from './styling';

const ToolsPanel = () => {
  return (
    <div className="w-[300px] h-full bg-base-lightest border-base-lighter border-2 border-t-0 shrink-0">
      <div className={PanelHeaderStyle}>
        <Text className={PanelHeaderTextStyle}>Data and Tools</Text>
      </div>
      <DataToolsPanel />
    </div>
  );
};

export default ToolsPanel;
