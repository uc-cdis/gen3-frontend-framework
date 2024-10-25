import React, { useState } from 'react';
import { useDeepCompareEffect, useDeepCompareMemo } from 'use-deep-compare';
import {
  MantineReactTable,
  MRT_RowSelectionState,
  MRT_Updater,
  useMantineReactTable,
} from 'mantine-react-table';
import { Button, Tooltip } from '@mantine/core';
import { MdOutlineRemoveCircle as RemoveIcon } from 'react-icons/md';
import AdditionalDataTable from './AdditionalDataTable';
import QueriesTable from './QueriesTable';
import { DatalistMembers } from '../types';
import { commonTableSettings } from './tableSettings';
import {
  getNumberOfDataSetItemsSelected,
  useDataLibrarySelection,
} from '../selection/SelectionContext';
import { selectAllDatasetMembers } from '../selection/selection';
import FilesTable from './FilesTable';
import EmptyList from '../EmptyList';

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

export interface ListsTableProps {
  listId: string;
  data: DatalistMembers;
  removeList: (itemId: string) => void;
}

const DataSetContentsTable = ({
  listId,
  data,
  removeList,
}: ListsTableProps) => {
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  const { selections, updateSelections } = useDataLibrarySelection();

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
          isCohort: data[key]?.queries.length !== 0 ? 'True' : 'False',
        };
      }),
    [data],
  );

  /**
   * Handles the change in row selection.
   *
   * @param {MRT_Updater<MRT_RowSelectionState>} updater - A function or value
   * that provides the new state of row selection. If a function is provided,
   * it will be called with the previous selection state.
   *
   * This function updates the state of selected rows by transforming the
   * updater's value. It generates a mapping of selected members for each
   * dataset, containing the dataset ID and an object representing the selected
   * object IDs. It then updates the selections for a given list and filters
   * the values to indicate whether each dataset has any selected objects.
   */
  const handleRowSelectionChange = (
    updater: MRT_Updater<MRT_RowSelectionState>,
  ) => {
    setRowSelection((prevSelection) => {
      const value =
        updater instanceof Function ? updater(prevSelection) : updater;

      const members = selectAllDatasetMembers(Object.keys(value), data);
      updateSelections(listId, members);
      return Object.keys(members).reduce(
        (acc: Record<string, boolean>, key) => {
          acc[key] = Object.keys(members[key].objectIds).length > 0;
          return acc;
        },
        {},
      );
    });
  };

  useDeepCompareEffect(() => {
    if (!selections[listId]) {
      // not found in selections, unselect all
      setRowSelection({});
      return;
    }

    const filteredValues = Object.keys(selections[listId]).reduce(
      (acc: Record<string, boolean>, key) => {
        const objectIds = selections[listId][key]?.objectIds;
        if (!objectIds) {
          console.warn(
            `Object IDs for key ${key} in list ${listId} are not available`,
          );
          return acc;
        }
        acc[key] = Object.keys(objectIds).length > 0;
        return acc;
      },
      {},
    );
    setRowSelection(filteredValues);
  }, [setRowSelection, selections, listId]);

  const table = useMantineReactTable({
    columns: columns,
    data: rows,
    ...commonTableSettings,
    getRowId: (originalRow) => originalRow.id,
    onRowSelectionChange: handleRowSelectionChange,
    enableSelectAll: false,
    enableBottomToolbar: rows.length > 10,
    enablePagination: rows.length > 10,
    enableRowSelection: true,
    state: { rowSelection },
    renderEmptyRowsFallback: () => <EmptyList />,
    defaultColumn: {
      minSize: 2,
    },
    displayColumnDefOptions: {
      'mrt-row-select': {
        size: 5,
        maxSize: 5,
        header: '',
      },
      'mrt-row-expand': {
        size: 5,
        maxSize: 5,
        header: '',
      },
      'mrt-row-actions': {
        size: 10,
        header: '',
      },
    },
    mantineSelectCheckboxProps: ({ row }) => {
      const selectedCount = getNumberOfDataSetItemsSelected(
        selections,
        listId,
        row.id,
      );
      const isIndeterminate =
        selectedCount > 0 && selectedCount != row.original.numItems;
      return {
        indeterminate: isIndeterminate,
        ...(isIndeterminate ? { checked: false } : {}),
      };
    },
    renderRowActions: ({ row }) => (
      <Tooltip
        label={
          row.original.isCohort
            ? 'Remove cohort from list'
            : 'Remove dataset from list'
        }
      >
        <Button
          variant="transparent"
          aria-label={`remove ${row.original.isCohort ? 'cohort' : 'dataset'}  ${row.original.name} from list`}
          onClick={() => {
            removeList(row.id);
          }}
        >
          <RemoveIcon size="1.5rem" />
          {row.original.itemType}
        </Button>
      </Tooltip>
    ),
    mantineDetailPanelProps: {
      style: {
        padding: '0px',
        margin: '0px',
      },
    },
    renderDetailPanel: ({ row }) => {
      const rowData = data[row.id];

      return (
        <div className="flex flex-col w-full gap-y-4 pr-4">
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
            <QueriesTable header="Queries" data={rowData?.queries} />
          )}
        </div>
      );
    },
  });

  return (
    <div className="flex flex-col w-full mr-8">
      <MantineReactTable table={table} />
    </div>
  );
};

export default DataSetContentsTable;
