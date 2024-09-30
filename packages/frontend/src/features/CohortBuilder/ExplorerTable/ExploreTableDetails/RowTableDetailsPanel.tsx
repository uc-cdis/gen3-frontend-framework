import { Stack, Table, Text } from '@mantine/core';
import { TableDetailsPanelProps } from './types';

export const RowTableDetailsPanel = ({ row }: TableDetailsPanelProps) => {
  const rowData = row?.original ?? {};

  const rows = Object.entries(rowData).map(([field, value]) => (
    <Table.Tr key={field}>
      <Table.Td>
        <Text fw="bold">{field}</Text>
      </Table.Td>
      <Table.Td>
        <Text>{value ? (value as string) : ''}</Text>
      </Table.Td>
    </Table.Tr>
  ));
  return (
    <Table striped highlightOnHover withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Field</Table.Th>
          <Table.Th>Value</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};

export default RowTableDetailsPanel;
