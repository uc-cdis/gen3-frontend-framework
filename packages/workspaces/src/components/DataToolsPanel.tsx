import React, { Component } from 'react';
import { Tabs } from '@mantine/core';
import {
  FaBell as AssistantIcon,
  FaBookOpen as DictionaryIcon,
} from 'react-icons/fa';
import CodingAssistantPanel from './CodingAssistantPanel';
import CompactDictionaryPanel from './CompactDictionaryPanel/CompactDictionaryPanel';

// Error boundary to surface render crashes instead of silent white-screen
class PanelErrorBoundary extends Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="rounded-lg border border-utility-error bg-utility-error bg-opacity-10 p-3 text-xs text-utility-error">
          <p className="font-semibold">Panel render error</p>
          <pre className="mt-1 whitespace-pre-wrap text-sm">
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    <Tabs
      defaultValue="dictionary"
      variant="outline"
      classNames={{ root: 'p-2' }}
    >
      {/* Tab bar */}
      <Tabs.List>
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
  );
};

export default DataToolsPanel;
