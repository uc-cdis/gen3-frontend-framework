import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import React from 'react';
import { FileItem } from '@gen3/core';

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
  const table = useMantineReactTable<FileItem>({
    columns,
    data: data,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableColumnResizing: true,
    columnResizeMode: 'onEnd',
  });

  return (
    <div className="flex flex-col ml-8 w-inherit">
      <span className="text-lg font-bold">{header}</span>
      <div>
        <MantineReactTable table={table} />
      </div>
    </div>
  );
};

export default FilesTable;
