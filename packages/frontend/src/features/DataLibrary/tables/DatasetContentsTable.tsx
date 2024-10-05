import React, { useEffect, useState } from 'react';
import { useDeepCompareEffect, useDeepCompareMemo } from 'use-deep-compare';
import {
  MantineReactTable,
  useMantineReactTable,
  MRT_RowSelectionState,
  MRT_Updater,
} from 'mantine-react-table';
import { ActionIcon } from '@mantine/core';
import { MdOutlineRemoveCircle as RemoveIcon } from 'react-icons/md';
import AdditionalDataTable from './AdditionalDataTable';
import QueriesTable from './QueriesTable';
import { DetalistMembers } from '../types';
import { commonTableSettings } from './tableSettings';
import {
  ListMembers,
  SelectedMembers,
  useDataLibrarySelection,
} from './SelectionContext';
import FilesTable from './FilesTable';

/**
 *  Component that manages a List items, which are composed of Dataset and/or Cohorts
 */
const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'id',
    header: 'Id',
  },
  {
    accessorKey: 'numFiles',
    header: '# Files',
  },
  {
    accessorKey: 'isAddDataSource',
    header: 'Additional Data Sources',
  },
];

class DatalistMembers {}

export interface ListsTableProps {
  listId: string;
  data: DetalistMembers;
  removeList: (listId: string, itemId: string) => void;
}

const DataSetContentsTable = ({
  listId,
  data,
  removeList,
}: ListsTableProps) => {
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  const { selections, updateSelections, numDatesetItemsSelected } =
    useDataLibrarySelection();

  // build the rows

  const rows = useDeepCompareMemo(
    () =>
      Object.keys(data).map((key) => {
        return {
          name: data[key].name,
          id: data[key].id,
          numFiles: data[key]?.files.length || 0,
          numItems:
            (data[key]?.files.length || 0) + (data[key]?.queries.length || 0),
          isAddDataSource:
            data[key]?.additionalData.length !== 0 ? 'True' : 'False',
        };
      }),
    [data],
  );

  const handleRowSelectionChange = (
    updater: MRT_Updater<MRT_RowSelectionState>,
  ) => {
    let value: MRT_RowSelectionState = {};
    setRowSelection((prevSelection) => {
      value = updater instanceof Function ? updater(prevSelection) : updater;
      return value;
    });

    const members = Object.keys(value).reduce((acc: ListMembers, datasetId) => {
      acc[datasetId] = {
        id: datasetId,
        objectIds: [
          ...data[datasetId].files.map((x) => x.guid),
          ...data[datasetId].queries.map((x) => x.id),
        ].reduce((acc: SelectedMembers, key) => {
          acc[key] = true;
          return acc;
        }, {}),
      };
      return acc;
    }, {});

    updateSelections(listId, members);
  };

  const table = useMantineReactTable({
    columns: columns,
    data: rows,
    ...commonTableSettings,
    getRowId: (originalRow) => originalRow.id,
    onRowSelectionChange: handleRowSelectionChange,
    enableSelectAll: false,
    state: { rowSelection },
    mantineSelectCheckboxProps: ({ row }) => {
      const selectedCount = numDatesetItemsSelected(listId, row.id);
      const isIndeterminate =
        selectedCount > 0 && selectedCount != row.original.numItems;
      return {
        color: 'violet',
        radius: 'xl',
        indeterminate: isIndeterminate,
        ...(isIndeterminate ? { checked: false } : {}),
      };
    },
    renderRowActions: ({ row }) => (
      <ActionIcon
        aria-label={`remove datalist ${row.original.name} from list`}
        onClick={() => {
          removeList(listId, row.id);
        }}
      >
        <RemoveIcon />
      </ActionIcon>
    ),
    renderDetailPanel: ({ row }) => {
      const rowData = data[row.id];

      return (
        <div className="flex flex-col w-full">
          {rowData?.files.length > 0 && (
            <FilesTable
              header={'Files'}
              datasetId={rowData.id}
              listId={listId}
              data={rowData?.files}
            />
          )}
          {rowData.additionalData.length > 0 && (
            <AdditionalDataTable
              header={'Additional Data'}
              data={rowData?.additionalData}
            />
          )}
          {rowData?.queries.length > 0 && (
            <QueriesTable
              header="Queries"
              data={rowData?.queries}
              selection={rowSelection}
              updateRowSelection={setRowSelection}
            />
          )}
        </div>
      );
    },
  });

  return (
    <div className="flex flex-col ml-8 w-full">
      <div>
        <MantineReactTable table={table} />
      </div>
    </div>
  );
};

export default DataSetContentsTable;
