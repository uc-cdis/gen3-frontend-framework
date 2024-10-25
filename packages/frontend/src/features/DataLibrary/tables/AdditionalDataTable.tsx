import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { commonTableSettings } from './tableSettings';
import { Text } from '@mantine/core';
import React from 'react';

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'documentation',
    header: 'Documentation',
  },
];

interface AdditionalDataTableTableProps {
  data: any;
  header: string;
}

const AdditionalDataTableTable = ({
  data,
  header,
}: AdditionalDataTableTableProps) => {
  const table = useMantineReactTable({
    columns,
    data: data,
    ...commonTableSettings,
    enableRowActions: false,
    enableRowSelection: false,
    enableBottomToolbar: data.length > 10,
    enablePagination: data.length > 10,
  });

  return (
    <div className="flex flex-col w-inherit gap-y-1">
      <Text fw={600} fs="md" c="secondary.5" tt="uppercase">
        {header}
      </Text>
      <MantineReactTable table={table} />
    </div>
  );
};

export default AdditionalDataTableTable;
