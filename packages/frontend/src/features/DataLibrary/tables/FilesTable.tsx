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
import { useDataLibrarySelection } from '../selection/SelectionContext';

interface FilesTableProps {
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
  {
    accessorKey: 'size',
    header: 'Size',
  },
  {
    accessorKey: 'dataset_guid',
    header: 'Dataset ID',
  },
];

const FilesTable = ({ listId, data, header }: FilesTableProps) => {
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  const { selections, updateListMemberSelections } = useDataLibrarySelection();

  // useEffect(() => {
  //   const sel = selections?.[listId]?.[datasetId]?.objectIds ?? {};
  //   setRowSelection(sel);
  // }, [listId, datasetId, selections]);

  // const handleRowSelectionChange = (
  //   updater: MRT_Updater<MRT_RowSelectionState>,
  // ) => {
  //   let value = {};
  //   setRowSelection((prevSelection) => {
  //     value = updater instanceof Function ? updater(prevSelection) : updater;
  //     return value;
  //   });
  //   updateListMemberSelections(listId, datasetId, value);
  // };

  const table = useMantineReactTable({
    columns,
    data: data,
    ...commonTableSettings,
    enableColumnActions: true,
    enableBottomToolbar: data.length > 10,
    enablePagination: data.length > 10,
    enableRowActions: false,
    enableGrouping: true,
    enableHiding: true,
    getRowId: (originalRow) => originalRow.id,
    //  onRowSelectionChange: handleRowSelectionChange,
    //state: { rowSelection },
  });

  return (
    <div className="flex flex-col gap-y-1">
      <Text fw={600} fs="md" c="secondary.5" tt="uppercase">
        {header}
      </Text>
      <MantineReactTable table={table} />
    </div>
  );
};

export default FilesTable;
