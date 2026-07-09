import React from 'react';
import { Tabs } from '@mantine/core';
import { Icon } from '@iconify-icon/react';
import CodingAssistantPanel from './CodingAssistantPanel';
import CompactDictionaryPanel from './CompactDictionaryPanel/CompactDictionaryPanel';
import { PanelErrorBoundary } from '@gen3/frontend';

export interface DataToolsPanelProps {
  schemaUrl?: string;
  kbUrl?: string;
}

const DEFAULT_DICTIONARY_SCHEMA_URL = '_dictionary/_all';
const ICON_SIZE = 16;

type Tab = 'dictionary' | 'assistant';

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  {
    id: 'dictionary',
    label: 'Dictionary',
    icon: (
      <Icon
        icon="gen3:compact-dictionary"
        width={ICON_SIZE}
        height={ICON_SIZE}
      />
    ),
  },
  /*
  {
    id: 'assistant',
    label: 'AI Assistant',
    icon: <Icon icon="gen3:ai-chat" width={ICON_SIZE} height={ICON_SIZE} />,
  },
  */
];

const DataToolsPanel = ({
  schemaUrl = DEFAULT_DICTIONARY_SCHEMA_URL,
  kbUrl,
}: DataToolsPanelProps) => {
  return (
    <div className="flex flex-col h-full">
      <Tabs
        defaultValue="dictionary"
        variant="outline"
        classNames={{ root: 'flex flex-col p-2' }}
        keepMounted
      >
        {/* Tab bar */}
        <Tabs.List className="bg-base-max">
          {TABS.map((tab) => (
            <Tabs.Tab value={tab.id} leftSection={tab.icon} key={tab.id}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {/* Tab content */}
        <div className="flex-1 min-h-0 h-full pt-4">
          <PanelErrorBoundary>
            <Tabs.Panel value="dictionary">
              <CompactDictionaryPanel schemaUrl={schemaUrl} />
            </Tabs.Panel>
            <Tabs.Panel value="assistant">
              <CodingAssistantPanel schemaUrl={schemaUrl} kbUrl={kbUrl} />
            </Tabs.Panel>
          </PanelErrorBoundary>
        </div>
      </Tabs>
    </div>
  );
};

export default DataToolsPanel;
