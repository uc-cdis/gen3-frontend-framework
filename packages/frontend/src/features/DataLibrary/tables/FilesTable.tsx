import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import React from 'react';
import { FileItem } from '@gen3/core';
import { Text } from '@mantine/core';
import { TableIcons } from '../../../components/Tables/TableIcons';
import { commonTableSettings } from './tableSettings';

interface FilesTableProps {
  data: Array<FileItem>;
  header: string;
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

const FilesTable = ({ data, header }: FilesTableProps) => {
  const table = useMantineReactTable({
    columns,
    data: data,
    ...commonTableSettings,
    enableRowActions: false,
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
