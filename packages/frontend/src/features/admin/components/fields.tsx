import React, {
  createContext,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  Accordion,
  ActionIcon,
  Autocomplete,
  Button,
  Group,
  JsonInput,
  NumberInput,
  Select,
  Stack,
  Switch,
  TagsInput,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import {
  FaArrowDown as DownIcon,
  FaArrowUp as UpIcon,
  FaPlus as PlusIcon,
  FaTrash as TrashIcon,
} from 'react-icons/fa';
import type { DiscoveryIndexConfig } from '../../Discovery/types';
import {
  type ConfigPath,
  getIn,
  insertAt,
  moveItem,
  removeAt,
  setIn,
} from '../Discovery/configPath';

/* ------------------------------------------------------------------ */
/* Editor context: the index config being edited + an update function  */
/* ------------------------------------------------------------------ */

export interface IndexEditorContextValue {
  config: DiscoveryIndexConfig;
  setConfig: (next: DiscoveryIndexConfig) => void;
}

const IndexEditorContext = createContext<IndexEditorContextValue | null>(null);

export const IndexEditorProvider = ({
  value,
  children,
}: {
  value: IndexEditorContextValue;
  children: ReactNode;
}): ReactElement => (
  <IndexEditorContext.Provider value={value}>
    {children}
  </IndexEditorContext.Provider>
);

export const useIndexEditor = () => {
  const ctx = useContext(IndexEditorContext);
  if (!ctx)
    throw new Error('useIndexEditor must be used within IndexEditorProvider');
  return ctx;
};

/** Read / write a single value at a path in the current index config */
export const useConfigValue = <T,>(
  path: ConfigPath,
): [T | undefined, (v: T | undefined) => void] => {
  const { config, setConfig } = useIndexEditor();
  const value = getIn(config, path) as T | undefined;
  const set = (v: T | undefined) => setConfig(setIn(config, path, v));
  return [value, set];
};

/* ------------------------------------------------------------------ */
/* Primitive field components                                          */
/* ------------------------------------------------------------------ */

interface BaseFieldProps {
  path: ConfigPath;
  label: string;
  description?: string;
}

export const TextField = ({
  path,
  label,
  description,
  placeholder,
}: BaseFieldProps & { placeholder?: string }): ReactElement => {
  const [value, setValue] = useConfigValue<string>(path);
  return (
    <TextInput
      size="xs"
      label={label}
      description={description}
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(e) =>
        setValue(
          e.currentTarget.value === '' ? undefined : e.currentTarget.value,
        )
      }
    />
  );
};

export const NumberField = ({
  path,
  label,
  description,
}: BaseFieldProps): ReactElement => {
  const [value, setValue] = useConfigValue<number>(path);
  return (
    <NumberInput
      size="xs"
      label={label}
      description={description}
      value={value ?? ''}
      onChange={(v) => setValue(typeof v === 'number' ? v : undefined)}
    />
  );
};

export const SwitchField = ({
  path,
  label,
  description,
}: BaseFieldProps): ReactElement => {
  const [value, setValue] = useConfigValue<boolean>(path);
  return (
    <Switch
      size="xs"
      label={label}
      description={description}
      checked={Boolean(value)}
      onChange={(e) => setValue(e.currentTarget.checked)}
    />
  );
};

export const SelectField = ({
  path,
  label,
  description,
  data,
  allowCustom = false,
}: BaseFieldProps & {
  data: string[];
  allowCustom?: boolean;
}): ReactElement => {
  const [value, setValue] = useConfigValue<string>(path);
  if (allowCustom) {
    return (
      <Autocomplete
        size="xs"
        label={label}
        description={description}
        data={data}
        value={value ?? ''}
        onChange={(v) => setValue(v === '' ? undefined : v)}
      />
    );
  }
  return (
    <Select
      size="xs"
      label={label}
      description={description}
      data={data}
      clearable
      value={value ?? null}
      onChange={(v) => setValue(v ?? undefined)}
    />
  );
};

export const StringListField = ({
  path,
  label,
  description,
  suggestions,
}: BaseFieldProps & { suggestions?: string[] }): ReactElement => {
  const [value, setValue] = useConfigValue<string[]>(path);
  return (
    <TagsInput
      size="xs"
      label={label}
      description={description}
      data={suggestions}
      value={value ?? []}
      onChange={(v) => setValue(v)}
      clearable
    />
  );
};

/**
 * Edits an arbitrary sub-object as JSON. Changes are only committed when
 * the text parses, so a half-typed edit never corrupts the config.
 */
export const JsonField = ({
  path,
  label,
  description,
  minRows = 6,
}: BaseFieldProps & { minRows?: number }): ReactElement => {
  const [value, setValue] = useConfigValue<unknown>(path);
  const serialized = value === undefined ? '' : JSON.stringify(value, null, 2);
  const [text, setText] = useState(serialized);
  const [error, setError] = useState<string | null>(null);

  // keep in sync when the value changes elsewhere (e.g. JSON tab, reset)
  useEffect(() => {
    setText(serialized);
    setError(null);
  }, [serialized]);

  return (
    <JsonInput
      size="xs"
      label={label}
      description={description}
      value={text}
      autosize
      minRows={minRows}
      maxRows={24}
      formatOnBlur
      error={error}
      onChange={(t) => {
        setText(t);
        if (t.trim() === '') {
          setError(null);
          setValue(undefined);
          return;
        }
        try {
          setValue(JSON.parse(t));
          setError(null);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Invalid JSON');
        }
      }}
    />
  );
};

/* ------------------------------------------------------------------ */
/* Array editor: add / remove / reorder items rendered as accordions   */
/* ------------------------------------------------------------------ */

interface ArrayEditorProps {
  path: ConfigPath;
  label: string;
  description?: string;
  newItem: () => unknown;
  itemTitle: (item: unknown, index: number) => string;
  renderItem: (itemPath: ConfigPath, index: number) => ReactNode;
}

export const ArrayEditor = ({
  path,
  label,
  description,
  newItem,
  itemTitle,
  renderItem,
}: ArrayEditorProps): ReactElement => {
  const { config, setConfig } = useIndexEditor();
  const items = getIn(config, path);
  const list = Array.isArray(items) ? items : [];
  const [opened, setOpened] = useState<string | null>(null);

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <div>
          <Text size="sm" fw={600}>
            {label}{' '}
            <Text span size="xs" c="dimmed">
              ({list.length})
            </Text>
          </Text>
          {description && (
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          )}
        </div>
        <Button
          size="compact-xs"
          variant="light"
          leftSection={<PlusIcon size={10} />}
          onClick={() => {
            setConfig(insertAt(config, path, newItem()));
            setOpened(String(list.length));
          }}
        >
          Add
        </Button>
      </Group>
      <Accordion
        variant="contained"
        chevronPosition="left"
        value={opened}
        onChange={setOpened}
      >
        {list.map((item, index) => (
          <Accordion.Item key={index} value={String(index)}>
            <Group gap={4} wrap="nowrap" pr="xs">
              <Accordion.Control>
                <Text size="xs" fw={500} truncate>
                  {itemTitle(item, index)}
                </Text>
              </Accordion.Control>
              <Tooltip label="Move up">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() =>
                    setConfig(moveItem(config, path, index, index - 1))
                  }
                >
                  <UpIcon size={10} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Move down">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  aria-label="Move down"
                  disabled={index === list.length - 1}
                  onClick={() =>
                    setConfig(moveItem(config, path, index, index + 1))
                  }
                >
                  <DownIcon size={10} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Remove">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  aria-label="Remove"
                  onClick={() => {
                    setConfig(removeAt(config, path, index));
                    setOpened(null);
                  }}
                >
                  <TrashIcon size={10} />
                </ActionIcon>
              </Tooltip>
            </Group>
            <Accordion.Panel>
              <Stack gap="xs">{renderItem([...path, index], index)}</Stack>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Stack>
  );
};
