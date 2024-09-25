import React, { useState } from 'react';
import { Tabs } from '@mantine/core';

// Define the structure for each sub-panel
interface SubPanel {
  label: string;
  content: React.ReactNode;
}

// Props for the AdminPanel component
interface AdminPanelProps {
  subPanels: SubPanel[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ subPanels }) => {
  const [activeTab, setActiveTab] = useState<string | null>(
    subPanels[0]?.label || null,
  );

  return (
    <Tabs
      orientation="vertical"
      value={activeTab}
      onChange={setActiveTab}
      styles={(theme) => ({
        tab: {
          paddingTop: theme.spacing.xs,
          paddingBottom: theme.spacing.xs,
          '&[data-active]': {
            backgroundColor: theme.colors.blue[7],
            color: theme.white,
          },
        },
        panel: {
          paddingLeft: theme.spacing.xl,
        },
      })}
    >
      <Tabs.List>
        {subPanels.map((panel) => (
          <Tabs.Tab key={panel.label} value={panel.label}>
            {panel.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {subPanels.map((panel) => (
        <Tabs.Panel key={panel.label} value={panel.label}>
          {panel.content}
        </Tabs.Panel>
      ))}
    </Tabs>
  );
};

export default AdminPanel;
