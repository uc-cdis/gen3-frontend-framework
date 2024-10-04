import {
  MantineReactTable,
  MRT_RowSelectionState,
  useMantineReactTable,
} from 'mantine-react-table';
import React from 'react';
import { FileItem } from '@gen3/core';
import { Text } from '@mantine/core';
import { commonTableSettings } from './tableSettings';
import { OnChangeFn } from '@tanstack/table-core';

interface FilesTableProps {
  data: Array<FileItem>;
  header: string;
  selection: MRT_RowSelectionState;
  updateRowSelection: OnChangeFn<MRT_RowSelectionState>;
}

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
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'size',
    header: 'Size',
  },
];

const FilesTable = ({
  data,
  header,
  selection,
  updateRowSelection,
}: FilesTableProps) => {
  const table = useMantineReactTable({
    columns,
    data: data,
    ...commonTableSettings,
    enableRowActions: false,
    getRowId: (originalRow) => originalRow.guid,
    onRowSelectionChange: updateRowSelection,
    state: { rowSelection: selection },
  });

  return (
    <div className="flex flex-col ml-8">
      <Text fw={600}>{header}</Text>
      <div className="mt-2">
        <MantineReactTable table={table} />
      </div>
    </div>
  );
};

export default FilesTable;
