import React, {
  type ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Badge,
  Button,
  CopyButton,
  FileButton,
  Group,
  JsonInput,
  List,
  Menu,
  ScrollArea,
  Select,
  Switch,
  Tabs,
  Text,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  FaChevronDown as ChevronDown,
  FaCopy as CopyIcon,
  FaDownload as DownloadIcon,
  FaUndo as UndoIcon,
  FaUpload as UploadIcon,
} from 'react-icons/fa';
import Discovery from '../../Discovery/Discovery';
import type {
  DiscoveryConfig,
  DiscoveryIndexConfig,
} from '../../Discovery/types';
import PanelErrorBoundary from '../../../components/PanelErrorBoundary';
import { IndexEditorProvider } from '../components/fields';
import { IndexConfigForm } from './sections';
import { checkDiscoveryIndexConfig } from './checkConfig';

export interface DiscoveryConfigEditorProps {
  /** The config currently deployed (loaded from discovery.json) */
  initialConfig: DiscoveryConfig;
  /** Commons name, used for the downloaded file name */
  commonsName?: string;
}

const EMPTY_INDEX = {
  label: 'New index',
  authz: [],
  features: {
    pageTitle: { enabled: true, text: 'Discover Datasets' },
    authorization: { enabled: false },
    search: {
      searchBar: { enabled: true, inputSubtitle: '', searchableTextFields: [] },
    },
  },
  aggregations: [],
  tags: { tagCategories: [] },
  tableConfig: { selectableRows: false, expandableRows: true },
  studyColumns: [],
  minimalFieldMapping: {
    uid: '_hdp_uid',
    authzField: 'authz',
    tagsListField: 'tags',
  },
} as unknown as DiscoveryIndexConfig;

/** Collect every value of a `field` key (and searchable fields) in the config, for suggestions */
const collectFieldNames = (
  obj: unknown,
  acc = new Set<string>(),
): Set<string> => {
  if (Array.isArray(obj)) obj.forEach((x) => collectFieldNames(x, acc));
  else if (obj && typeof obj === 'object') {
    Object.entries(obj).forEach(([k, v]) => {
      if (typeof v === 'string' && /field$/i.test(k) && v) acc.add(v);
      else if (k === 'searchableTextFields' && Array.isArray(v))
        v.forEach((f) => typeof f === 'string' && acc.add(f));
      else collectFieldNames(v, acc);
    });
  }
  return acc;
};

const indexLabel = (c: DiscoveryIndexConfig | undefined, i: number) =>
  c?.label ?? c?.features?.pageTitle?.text ?? `Index ${i}`;

const downloadJson = (data: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2) + '\n'], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const isDiscoveryConfig = (x: unknown): x is DiscoveryConfig =>
  typeof x === 'object' &&
  x !== null &&
  Array.isArray((x as { metadataConfig?: unknown }).metadataConfig);

/* ------------------------- Raw JSON tab --------------------------- */

const RawJsonEditor = ({
  config,
  onChange,
}: {
  config: DiscoveryConfig;
  onChange: (c: DiscoveryConfig) => void;
}): ReactElement => {
  const serialized = useMemo(() => JSON.stringify(config, null, 2), [config]);
  const [text, setText] = useState(serialized);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setText(serialized);
    setError(null);
  }, [serialized]);

  return (
    <JsonInput
      size="xs"
      value={text}
      autosize
      minRows={30}
      error={error}
      styles={{ input: { fontFamily: 'monospace' } }}
      onChange={(t) => {
        setText(t);
        try {
          const parsed: unknown = JSON.parse(t);
          if (!isDiscoveryConfig(parsed)) {
            setError('Top level must be an object with a metadataConfig array');
            return;
          }
          setError(null);
          onChange(parsed);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Invalid JSON');
        }
      }}
    />
  );
};

/* ---------------------------- Editor ------------------------------ */

const DiscoveryConfigEditor = ({
  initialConfig,
  commonsName = 'gen3',
}: DiscoveryConfigEditorProps): ReactElement => {
  const [config, setConfig] = useState<DiscoveryConfig>(initialConfig);
  const [selected, setSelected] = useState(0);
  const [livePreview, setLivePreview] = useState(true);
  const [importError, setImportError] = useState<string | null>(null);
  const resetRef = useRef<() => void>(null);

  const indexes = config.metadataConfig ?? [];
  const current = indexes[selected];
  const dirty = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(initialConfig),
    [config, initialConfig],
  );
  const fields = useMemo(
    () => Array.from(collectFieldNames(config.metadataConfig)).sort(),
    [config.metadataConfig],
  );
  const issues = useMemo(() => checkDiscoveryIndexConfig(current), [current]);

  // Preview only the index being edited; debounce so typing doesn't refetch on every key
  const [debouncedIndex] = useDebouncedValue(current, 600);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [previewConfig, setPreviewConfig] = useState<DiscoveryConfig | null>(
    null,
  );
  useEffect(() => {
    if (!livePreview || !debouncedIndex) return;
    setPreviewConfig({ ...config, metadataConfig: [debouncedIndex] });
    setPreviewVersion((v) => v + 1);
    // config intentionally omitted: preview tracks the debounced index only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedIndex, livePreview]);

  const setIndexConfig = (next: DiscoveryIndexConfig) =>
    setConfig((c) => ({
      ...c,
      metadataConfig: c.metadataConfig.map((m, i) =>
        i === selected ? next : m,
      ),
    }));

  const addIndex = (copyOf?: DiscoveryIndexConfig) => {
    const item = copyOf
      ? {
          ...structuredClone(copyOf),
          label: `${indexLabel(copyOf, selected)} (copy)`,
        }
      : structuredClone(EMPTY_INDEX);
    setConfig((c) => ({ ...c, metadataConfig: [...c.metadataConfig, item] }));
    setSelected(indexes.length);
  };

  const removeIndex = () => {
    setConfig((c) => ({
      ...c,
      metadataConfig: c.metadataConfig.filter((_, i) => i !== selected),
    }));
    setSelected(Math.max(0, selected - 1));
  };

  const importFile = async (file: File | null) => {
    resetRef.current?.();
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isDiscoveryConfig(parsed))
        throw new Error('File has no metadataConfig array');
      setConfig(parsed);
      setSelected(0);
      setImportError(null);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Could not read file');
    }
  };

  const errorCount = issues.filter((i) => i.level === 'error').length;
  const warningCount = issues.length - errorCount;

  return (
    <div className="flex flex-col w-full h-[calc(100vh-var(--gen3-header-height,8rem))] min-h-[600px]">
      {/* Toolbar */}
      <Group
        justify="space-between"
        className="px-4 py-2 border-b border-base-light bg-base-max"
      >
        <Group gap="xs">
          <Text fw={600}>Discovery Config Editor</Text>
          <Badge variant="outline" color="secondary.2" size="lg" radius="xs">
            {commonsName}
          </Badge>
          {dirty && (
            <Badge variant="light" color="yellow">
              Unsaved changes
            </Badge>
          )}
          {errorCount > 0 && <Badge color="red">{errorCount} errors</Badge>}
          {warningCount > 0 && (
            <Badge color="orange">{warningCount} warnings</Badge>
          )}
        </Group>
        <Group gap="xs">
          <Select
            size="xs"
            aria-label="Metadata index"
            w={220}
            data={indexes.map((c, i) => ({
              value: String(i),
              label: indexLabel(c, i),
            }))}
            value={String(selected)}
            onChange={(v) => setSelected(Number(v ?? 0))}
            allowDeselect={false}
          />
          <Menu position="bottom-end">
            <Menu.Target>
              <Button
                size="xs"
                variant="default"
                rightSection={<ChevronDown size={10} />}
              >
                Index
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => addIndex()}>Add empty index</Menu.Item>
              <Menu.Item
                disabled={!current}
                onClick={() => current && addIndex(current)}
              >
                Duplicate current
              </Menu.Item>
              <Menu.Item
                color="red"
                disabled={indexes.length <= 1}
                onClick={removeIndex}
              >
                Remove current
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <FileButton
            resetRef={resetRef}
            onChange={importFile}
            accept="application/json"
          >
            {(props) => (
              <Button
                size="xs"
                variant="default"
                leftSection={<UploadIcon size={10} />}
                {...props}
              >
                Import
              </Button>
            )}
          </FileButton>
          <CopyButton value={JSON.stringify(config, null, 2)}>
            {({ copied, copy }) => (
              <Button
                size="xs"
                variant="default"
                leftSection={<CopyIcon size={10} />}
                onClick={copy}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            )}
          </CopyButton>
          <Button
            size="xs"
            leftSection={<DownloadIcon size={10} />}
            onClick={() => downloadJson(config, 'discovery.json')}
          >
            Download
          </Button>
          <Tooltip label="Discard changes and reload the deployed config">
            <Button
              size="xs"
              variant="subtle"
              color="red"
              disabled={!dirty}
              leftSection={<UndoIcon size={10} />}
              onClick={() => {
                setConfig(initialConfig);
                setSelected(0);
              }}
            >
              Reset
            </Button>
          </Tooltip>
        </Group>
      </Group>

      {importError && (
        <Alert
          color="red"
          withCloseButton
          onClose={() => setImportError(null)}
          className="m-2"
        >
          Import failed: {importError}
        </Alert>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Editor pane */}
        <div className="w-[38%] min-w-[380px] border-r border-base-light flex flex-col min-h-0">
          <Tabs defaultValue="form" className="flex flex-col min-h-0 flex-1">
            <Tabs.List>
              <Tabs.Tab value="form">Form</Tabs.Tab>
              <Tabs.Tab value="json">JSON Editor</Tabs.Tab>
              <Tabs.Tab value="issues">
                Checks {issues.length > 0 ? `(${issues.length})` : ''}
              </Tabs.Tab>
            </Tabs.List>
            <ScrollArea className="flex-1" p="sm">
              <Tabs.Panel value="form">
                {current ? (
                  <IndexEditorProvider
                    value={{ config: current, setConfig: setIndexConfig }}
                  >
                    <IndexConfigForm fields={fields} />
                  </IndexEditorProvider>
                ) : (
                  <Text size="sm">
                    No index selected. Use Index → Add empty index.
                  </Text>
                )}
              </Tabs.Panel>
              <Tabs.Panel value="json">
                <Text size="xs" c="dimmed" mb="xs">
                  Full discovery.json (all indexes). Changes apply when the JSON
                  is valid.
                </Text>
                <RawJsonEditor config={config} onChange={setConfig} />
              </Tabs.Panel>
              <Tabs.Panel value="issues">
                {issues.length === 0 ? (
                  <Text size="sm" c="dimmed">
                    No problems found in “{indexLabel(current, selected)}”.
                  </Text>
                ) : (
                  <List size="sm" spacing="xs">
                    {issues.map((issue, i) => (
                      <List.Item key={i}>
                        <Badge
                          size="xs"
                          color={issue.level === 'error' ? 'red' : 'orange'}
                          mr="xs"
                        >
                          {issue.level}
                        </Badge>
                        {issue.message}
                      </List.Item>
                    ))}
                  </List>
                )}
              </Tabs.Panel>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Preview pane */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <Group
            justify="space-between"
            className="px-3 py-1 border-b border-base-light"
          >
            <Text size="xs" c="dimmed">
              Live preview of “{indexLabel(current, selected)}” against this
              commons’ metadata
            </Text>
            <Group gap="xs">
              <Switch
                size="xs"
                label="Auto-refresh"
                checked={livePreview}
                onChange={(e) => setLivePreview(e.currentTarget.checked)}
              />
              <Button
                size="compact-xs"
                variant="light"
                onClick={() => {
                  if (!current) return;
                  setPreviewConfig({ ...config, metadataConfig: [current] });
                  setPreviewVersion((v) => v + 1);
                }}
              >
                Refresh
              </Button>
            </Group>
          </Group>
          <ScrollArea className="flex-1">
            {previewConfig ? (
              <PanelErrorBoundary key={previewVersion}>
                <Discovery
                  key={previewVersion}
                  discoveryConfig={previewConfig}
                />
              </PanelErrorBoundary>
            ) : (
              <Text size="sm" c="dimmed" p="md">
                Preview will appear here.
              </Text>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryConfigEditor;
