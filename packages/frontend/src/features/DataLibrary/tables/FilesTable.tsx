import {
  MantineReactTable,
  MRT_RowSelectionState,
  MRT_Updater,
  useMantineReactTable,
} from 'mantine-react-table';
import React, { useEffect, useState } from 'react';
import { FileItem } from '@gen3/core';
import { Text } from '@mantine/core';
import { commonTableSettings } from './tableSettings';
import { OnChangeFn } from '@tanstack/table-core';
import { useDataLibrarySelection } from './SelectionContext';

interface FilesTableProps {
  datasetId: string;
  listId: string;
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

const FilesTable = ({ listId, datasetId, data, header }: FilesTableProps) => {
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  const { selections, updateListMemberSelections } = useDataLibrarySelection();

  useEffect(() => {
    const sel = selections?.[listId]?.[datasetId]?.objectIds ?? {};
    setRowSelection(sel);
  }, [listId, datasetId, selections]);

  const handleRowSelectionChange = (
    updater: MRT_Updater<MRT_RowSelectionState>,
  ) => {
    let value = {};
    setRowSelection((prevSelection) => {
      value = updater instanceof Function ? updater(prevSelection) : updater;
      return value;
    });
    console.log('Files Before', selections);
    console.log('updateListMemberSelections', listId, datasetId, value);
    updateListMemberSelections(listId, datasetId, value);
    console.log('Files After', selections);
  };

  const table = useMantineReactTable({
    columns,
    data: data,
    ...commonTableSettings,
    enableRowActions: false,
    getRowId: (originalRow) => originalRow.guid,
    onRowSelectionChange: handleRowSelectionChange,
    state: { rowSelection },
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
