import React from 'react';
import DataToolsPanel from '../../components/DataToolsPanel';

import HorizontalAccordion from '../../components/HorizontalAccordian';

interface ToolsPanelProps {
  expanded: boolean;
  setExpanded: (_arg: boolean) => void;
}

const ToolsPanel = ({
  expanded = true,
  setExpanded = () => {},
}: ToolsPanelProps) => {
  return (
    <HorizontalAccordion
      label="Data and Tools"
      expanded={expanded}
      setExpanded={setExpanded}
    >
      <DataToolsPanel />
    </HorizontalAccordion>
  );
};

export default ToolsPanel;
