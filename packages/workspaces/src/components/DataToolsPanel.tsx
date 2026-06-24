import React from 'react';
import { Tabs } from '@mantine/core';
import {
  FaBell as AssistantIcon,
  FaBookOpen as DictionaryIcon,
} from 'react-icons/fa';
import CodingAssistantPanel from './CodingAssistantPanel';
import CompactDictionaryPanel from './CompactDictionaryPanel/CompactDictionaryPanel';
import { PanelErrorBoundary } from '@gen3/frontend';

export interface DataToolsPanelProps {
  schemaUrl?: string;
  kbUrl?: string;
}

const DEFAULT_DICTIONARY_SCHEMA_URL = '_dictionary/_all';

type Tab = 'dictionary' | 'assistant';

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  {
    id: 'dictionary',
    label: 'Dictionary',
    icon: <DictionaryIcon />,
  },
  {
    id: 'assistant',
    label: 'AI Assistant',
    icon: <AssistantIcon />,
  },
];

const DataToolsPanel = ({
  schemaUrl = DEFAULT_DICTIONARY_SCHEMA_URL,
  kbUrl,
}: DataToolsPanelProps) => {
  return (
    <div className="flex shrink-0">
      <Tabs
        defaultValue="dictionary"
        variant="outline"
        classNames={{ root: 'p-2' }}
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
        <div className="min-h-0 flex-1 overflow-hidden pt-4">
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
