import {
  MantineReactTable,
  MRT_RowSelectionState,
  MRT_Updater,
  useMantineReactTable,
} from 'mantine-react-table';
import React, { useEffect, useState } from 'react';
import { FileItem } from '@gen3/core';
import { Button, Text, Tooltip } from '@mantine/core';
import { commonTableSettings } from './tableSettings';
import { useDataLibrarySelection } from '../selection/SelectionContext';
import { MdOutlineRemoveCircle as RemoveIcon } from 'react-icons/md';

interface FilesTableProps {
  datasetId: string;
  listId: string;
  data: Array<FileItem>;
  header: string;
  size?: string;
  removeList: (itemId: string) => void;
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
  listId,
  datasetId,
  data,
  header,
  size = 'sm',
  removeList = (itemId: string) => null, //TODO Support removing files from dataset
}: FilesTableProps) => {
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
    updateListMemberSelections(listId, datasetId, value);
  };

  const table = useMantineReactTable({
    columns,
    data: data,
    ...commonTableSettings(size),
    enableBottomToolbar: data.length > 10,
    enablePagination: data.length > 10,
    enableRowActions: true,
    enableHiding: true,
    getRowId: (originalRow) => originalRow.id,
    onRowSelectionChange: handleRowSelectionChange,
    state: { rowSelection },
  });

  return (
    <div className="flex flex-col gap-y-1">
      <Text fw={600} fs={size} c="secondary.5" tt="uppercase">
        {header}
      </Text>
      <MantineReactTable table={table} />
    </div>
  );
};

export default FilesTable;
