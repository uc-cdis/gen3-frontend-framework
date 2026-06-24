import React, { useMemo } from 'react';
import {
  FaBell as AssistantIcon,
  FaBookOpen as DictionaryIcon,
} from 'react-icons/fa';
import CodingAssistantPanel from './CodingAssistantPanel';
import CompactDictionaryPanel from './CompactDictionaryPanel/CompactDictionaryPanel';
import { NavigationRail, NavigationRailItem } from '@gen3/frontend';

export interface DataToolsPanelProps {
  schemaUrl?: string;
  kbUrl?: string;
  expanded?: boolean;
  setExpanded?: (_arg: boolean) => void;
  width?: number;
  collapsedWidth?: number;
}

const DEFAULT_DICTIONARY_SCHEMA_URL = '_dictionary/_all';

const DataToolsPanel = ({
  schemaUrl = DEFAULT_DICTIONARY_SCHEMA_URL,
  kbUrl,
  expanded = true,
  setExpanded,
  width = 300,
  collapsedWidth = 50,
}: DataToolsPanelProps) => {
  const TABS: Array<NavigationRailItem> = useMemo(
    () => [
      {
        label: 'Dictionary',
        panel: (
          <CompactDictionaryPanel schemaUrl={DEFAULT_DICTIONARY_SCHEMA_URL} />
        ),
        icon: <DictionaryIcon />,
      },
      {
        label: 'AI Assistant',
        panel: <CodingAssistantPanel schemaUrl={schemaUrl} kbUrl={kbUrl} />,
        icon: <AssistantIcon />,
      },
    ],
    [schemaUrl, kbUrl],
  );

  return (
    <NavigationRail
      items={TABS}
      label="Data Tools"
      width={width}
      collapsedWidth={collapsedWidth}
      defaultValue={TABS[0].label}
      expanded={expanded}
      setExpanded={setExpanded}
    />
  );
};

export default DataToolsPanel;
