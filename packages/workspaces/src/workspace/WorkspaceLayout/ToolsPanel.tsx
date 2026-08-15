import React from 'react';
import DataToolsPanel from '../../components/DataToolsPanel';

import HorizontalAccordion from '../../components/HorizontalAccordian';

interface ToolsPanelProps {
  expanded: boolean;
  setExpanded: (_arg: boolean) => void;
  width?: number;
}

const ToolsPanel = ({
  expanded = true,
  setExpanded = () => {},
  width = 310,
}: ToolsPanelProps) => {
  return (
    <HorizontalAccordion
      label="Data & Tools"
      expanded={expanded}
      setExpanded={setExpanded}
      expandedWidth={width}
    >
      <DataToolsPanel />
    </HorizontalAccordion>
  );
};

export default ToolsPanel;
