import React from 'react';
import { ActionIcon, Text } from '@mantine/core';

import DataToolsPanel from '../../components/DataToolsPanel';
import { PanelHeaderStyle, PanelHeaderTextStyle } from './styling';
import { Icon } from '@iconify-icon/react';

// Total expanded width = CONTENT_WIDTH + BUTTON_STRIP_WIDTH (300px)
const CONTENT_WIDTH = 236;
const BUTTON_STRIP_WIDTH = 64;

interface ToolsPanelProps {
  expanded?: boolean;
  setExpanded?: (_arg: boolean) => void;
}

const ToolsPanel = ({
  expanded = true,
  setExpanded = () => {},
}: ToolsPanelProps) => {
  return (
    <div className="flex h-full shrink-0 bg-base-lightest border-base-lighter border-2 border-t-0">
      {/* Collapsible content column */}
      <div
        className="overflow-hidden shrink-0 h-full"
        style={{
          width: expanded ? CONTENT_WIDTH : 0,
          transition: 'width 500ms ease',
        }}
      >
        <div style={{ width: CONTENT_WIDTH }} className="h-full flex flex-col">
          <div className={PanelHeaderStyle}>
            <Text className={PanelHeaderTextStyle}>Data and Tools</Text>
          </div>
          <DataToolsPanel />
        </div>
      </div>

      {/* Always-visible button strip */}
      <div
        className="flex-none flex flex-col items-center pt-2 border-l-2 border-base-lighter"
        style={{ opacity: 100, transition: 'opacity 500ms ease' }}
      >
        <ActionIcon variant="outline" onClick={() => setExpanded(!expanded)}>
          {expanded ? (
            <Icon icon="gen3:left-panel-close" width={24} height={24} />
          ) : (
            <Icon icon="gen3:left-panel-open" width={24} height={24} />
          )}
        </ActionIcon>
      </div>
    </div>
  );
};

export default ToolsPanel;
