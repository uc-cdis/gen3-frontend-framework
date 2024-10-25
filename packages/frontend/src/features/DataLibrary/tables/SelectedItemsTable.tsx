import {
  MantineReactTable,
  MRT_RowSelectionState,
  MRT_Updater,
  MRT_Cell,
  useMantineReactTable,
} from 'mantine-react-table';
import React, { useMemo, useState } from 'react';
import { Box, Text } from '@mantine/core';
import { isCohortItem } from '@gen3/core';
import { useDataLibrarySelection } from '../selection/SelectionContext';
import { TableIcons } from '../../../components/Tables/TableIcons';

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
    size: 100,
    maxSize: 150,
    Cell: ({ cell }: { cell: MRT_Cell<SelectedItemsTableRow> }) => {
      return (
        <Text fw={400} size="sm" lineClamp={2}>
          {cell.getValue<string>() ?? 'N/A'}
        </Text>
      );
    },
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
    accessorKey: 'datasetName',
    header: 'Dataset Name',
  },
  {
    accessorKey: 'datasetId',
    header: 'Dataset ID',
  },
];

interface SelectedItemsTableRow {
  datasetName: string;
  datasetId: string;
  type: string;
  size?: string;
  name?: string;
  description?: string;
}

const SelectedItemsTable = () => {
  const { gatheredItems } = useDataLibrarySelection();
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  const handleRowSelectionChange = (
    updater: MRT_Updater<MRT_RowSelectionState>,
  ) => {
    let value = {};
    setRowSelection((prevSelection) => {
      value = updater instanceof Function ? updater(prevSelection) : updater;
      return value;
    });
  };

  const rows = useMemo(() => {
    return gatheredItems.map((item) => {
      if (isCohortItem(item)) {
        return {
          name: item.name,
          description: item.description,
          type: item.itemType as string,
          size: undefined,
          datasetName: item.name,
          datasetId: item.datasetId,
        } as SelectedItemsTableRow;
      }

      return {
        name: item.name,
        description: item.description,
        type: item.type,
        size: item.size,
        datasetId: item.datasetId,
        datasetName: item.datasetName,
      } as SelectedItemsTableRow;
    });
  }, [gatheredItems]);

  const table = useMantineReactTable<SelectedItemsTableRow>({
    columns,
    data: rows,
    enableColumnResizing: false,
    icons: TableIcons,
    enableTopToolbar: false,
    enableRowSelection: true,
    enableSelectAll: true,
    enableColumnFilters: false,
    enableColumnActions: false,
    enablePagination: true,
    enableRowActions: false,
    enableStickyFooter: true,
    enableStickyHeader: true,
    onRowSelectionChange: handleRowSelectionChange,
    state: { rowSelection },
    initialState: {
      density: 'xs',
      columnPinning: {
        left: ['mrt-row-select', 'mrt-row-expand'],
        right: ['mrt-row-actions'],
      },
    },
    layoutMode: 'semantic',
    mantineDetailPanelProps: {
      style: {
        boxShadow: '0 -2px 0px 0px var(--table-border-color) inset',
      },
    },
    mantineTableProps: {
      style: {
        backgroundColor: 'var(--mantine-color-base-1)',
        '--mrt-striped-row-background-color': 'var(--mantine-color-base-3)',
      },
    },
    mantineTableHeadCellProps: {
      style: {
        backgroundColor: 'var(--mantine-color-table-1)',
        color: 'var(--mantine-color-table-contrast-1)',
        textAlign: 'center',
        padding: '0 0 0 0',
        fontWeight: 600,
        fontSize: 'var(--mantine-font-size-sm)',
      },
    },
  });

  return (
    <div className="flex flex-col ml-8">
      <div className="mt-2">
        <MantineReactTable table={table} />
      </div>
    </div>
  );
};

export default SelectedItemsTable;
