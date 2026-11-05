import React, { type ReactElement, useEffect, useRef, useState } from 'react';
import {
  ActionIcon,
  Button,
  Checkbox,
  Paper,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { FiPlus, FiSliders, FiTrash2 } from 'react-icons/fi';
import type { ParamDef } from '@gen3/core';
import AddParamsModal from './AddParamsModal';
import ParamValueInput from './ParamValueInput';
import {
  addAnother,
  addRows,
  canRepeat,
  newRow,
  removeRow,
  setAllEnabled,
  updateRow,
  type ParamRow,
} from './params';

interface QueryParamsProps {
  resource: string;
  // Undefined while /metadata loads, if it fails, or if it doesn't list the type
  params?: ParamDef[];
  // Why params can't be added right now, shown on the disabled button
  unavailable?: string;
  rows: ParamRow[];
  onRowsChange: (update: (rows: ParamRow[]) => ParamRow[]) => void;
}

const QueryParams = ({
  resource,
  params,
  unavailable,
  rows,
  onRowsChange,
}: QueryParamsProps): ReactElement => {
  const [opened, { open, close }] = useDisclosure(false);
  const addButton = useRef<HTMLButtonElement>(null);

  // The new row that should get the cursor. Its input gets focusInput as a ref,
  // and the effect focuses it once it's on screen.
  const [focusId, setFocusId] = useState<string>();
  const focusInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    focusInput.current?.focus();
  }, [focusId]);

  const update = (id: string, changes: Partial<ParamRow>) =>
    onRowsChange((prev) => updateRow(prev, id, changes));
  const remove = (id: string) => onRowsChange((prev) => removeRow(prev, id));

  const add = (picked: ParamDef[]) => {
    const added = picked.map(newRow);
    onRowsChange((prev) => addRows(prev, added));
    setFocusId(added[0]?.id);
    close();
  };
  const addBelow = (row: ParamRow) => {
    const added = newRow(row);
    onRowsChange((prev) => addAnother(prev, row.id, added));
    setFocusId(added.id);
  };
  // Closed without adding, so focus goes back to where it was
  const cancel = () => {
    close();
    addButton.current?.focus();
  };

  const allOn = rows.length > 0 && rows.every((row) => row.enabled);
  const someOn = rows.some((row) => row.enabled);

  return (
    <Paper withBorder radius="md" shadow="xs" p="md">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiSliders className="text-blue-600" aria-hidden />
          <Text fw={600}>Query Parameters</Text>
        </div>
        <Tooltip label={unavailable} disabled={!unavailable}>
          <span>
            <Button
              ref={addButton}
              variant="light"
              radius="xl"
              className="enabled:bg-blue-50 enabled:text-blue-700 enabled:hover:bg-blue-100"
              leftSection={<FiPlus />}
              onClick={open}
              disabled={!params}
            >
              Add Parameter
            </Button>
          </span>
        </Tooltip>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200">
        <Table verticalSpacing="sm">
          <Table.Thead className="bg-gray-50">
            <Table.Tr>
              <Table.Th w={48}>
                <Checkbox
                  aria-label="Turn all params on or off"
                  checked={allOn}
                  indeterminate={someOn && !allOn}
                  disabled={rows.length === 0}
                  onChange={() =>
                    onRowsChange((prev) => setAllEnabled(prev, !allOn))
                  }
                />
              </Table.Th>
              <Table.Th w={280}>Key</Table.Th>
              <Table.Th>Value</Table.Th>
              <Table.Th w={88}>
                <div className="flex justify-end">
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label="Remove all params"
                    disabled={rows.length === 0}
                    onClick={() => onRowsChange(() => [])}
                  >
                    <FiTrash2 />
                  </ActionIcon>
                </div>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length === 0 ? (
              <Table.Tr>
                <Table.Td
                  colSpan={4}
                  className="py-6 text-center text-gray-500"
                >
                  No parameters yet. Use Add Parameter to pick some.
                </Table.Td>
              </Table.Tr>
            ) : (
              rows.map((row) => (
                <Table.Tr key={row.id}>
                  <Table.Td>
                    <Checkbox
                      aria-label={`Send ${row.name}`}
                      checked={row.enabled}
                      onChange={() => update(row.id, { enabled: !row.enabled })}
                    />
                  </Table.Td>
                  <Table.Td
                    className={`font-mono ${row.enabled ? '' : 'text-gray-400'}`}
                  >
                    {row.name}
                    {row.name === '_count' && (
                      <Text
                        span
                        size="xs"
                        c="dimmed"
                        className="ml-2 font-sans"
                      >
                        per page
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <ParamValueInput
                      ref={row.id === focusId ? focusInput : undefined}
                      row={row}
                      onChange={(changes) => update(row.id, changes)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <div className="flex justify-end gap-1">
                      {canRepeat(row) && (
                        <Tooltip
                          label={`Add another ${row.name} condition (AND)`}
                        >
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            aria-label={`Add another ${row.name}`}
                            onClick={() => addBelow(row)}
                          >
                            <FiPlus />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        aria-label={`Remove ${row.name}`}
                        onClick={() => remove(row.id)}
                      >
                        <FiTrash2 />
                      </ActionIcon>
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </div>

      {params && (
        <AddParamsModal
          opened={opened}
          onClose={cancel}
          resource={resource}
          params={params}
          rows={rows}
          onAdd={add}
        />
      )}
    </Paper>
  );
};

export default QueryParams;
