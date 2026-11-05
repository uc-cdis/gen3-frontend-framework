import React, { type ReactElement, useState } from 'react';
import {
  Button,
  Checkbox,
  Modal,
  ScrollArea,
  Text,
  TextInput,
} from '@mantine/core';
import { FiSearch } from 'react-icons/fi';
import type { ParamDef } from '@gen3/core';
import type { ParamRow } from './params';

interface ParamPickerProps {
  params: ParamDef[];
  rows: ParamRow[];
  onAdd: (picked: ParamDef[]) => void;
  onCancel: () => void;
}

const ParamPicker = ({
  params,
  rows,
  onAdd,
  onCancel,
}: ParamPickerProps): ReactElement => {
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (name: string) =>
    setPicked((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );

  // Already in the table. Another value for it is added with the + on its row.
  const isTaken = (param: ParamDef) =>
    rows.some((row) => row.name === param.name);

  const query = search.trim().toLowerCase();
  const shown = params.filter((p) => p.name.toLowerCase().includes(query));
  const count = picked.length;

  return (
    <>
      <TextInput
        data-autofocus
        aria-label="Search params"
        placeholder="Search params…"
        leftSection={<FiSearch />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ScrollArea.Autosize mah={360} mt="sm">
        {shown.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="md">
            No params match &quot;{search}&quot;
          </Text>
        ) : (
          shown.map((param) => {
            const taken = isTaken(param);
            return (
              <div
                key={param.name}
                className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-gray-50"
              >
                <Checkbox
                  label={<span className="font-mono">{param.name}</span>}
                  checked={picked.includes(param.name)}
                  disabled={taken}
                  onChange={() => toggle(param.name)}
                />
                <Text size="xs" c="dimmed">
                  {taken ? 'added' : param.type}
                </Text>
              </div>
            );
          })
        )}
      </ScrollArea.Autosize>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => onAdd(params.filter((p) => picked.includes(p.name)))}
          disabled={count === 0}
        >
          {count === 0
            ? 'Add parameters'
            : `Add ${count} parameter${count === 1 ? '' : 's'}`}
        </Button>
      </div>
    </>
  );
};

interface AddParamsModalProps {
  opened: boolean;
  onClose: () => void;
  resource: string;
  params: ParamDef[];
  rows: ParamRow[];
  // The parent closes the modal after adding, and puts focus on the new row
  onAdd: (picked: ParamDef[]) => void;
}

// Pick several params at once. Each one becomes a row with an empty value.
const AddParamsModal = ({
  opened,
  onClose,
  resource,
  params,
  rows,
  onAdd,
}: AddParamsModalProps): ReactElement => (
  <Modal
    opened={opened}
    onClose={onClose}
    title={`Add parameters: ${resource}`}
    size="lg"
    // QueryParams decides where focus goes once the modal closes
    returnFocus={false}
  >
    <ParamPicker params={params} rows={rows} onAdd={onAdd} onCancel={onClose} />
  </Modal>
);

export default AddParamsModal;
