import {
  MantineReactTable,
  MRT_RowSelectionState,
  MRT_Updater,
  useMantineReactTable,
} from 'mantine-react-table';
import React, { useEffect, useMemo, useState } from 'react';
import { isCohortItem } from '@gen3/core';
import { Text } from '@mantine/core';
import { commonTableSettings } from './tableSettings';
import { useDataLibrarySelection } from '../selection/SelectionContext';
import { TableIcons } from '../../../components/Tables/TableIcons';
import { number } from 'echarts';

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

  const rows = useMemo(() => {
    return gatheredItems.map((item) => {
      if (isCohortItem(item)) {
        return {
          name: item.name,
          description: item.description,
          type: item.itemType as string,
          size: undefined,
          datasetName: item.name,
          datasetId: item.id,
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
    enableColumnFilters: false,
    enableColumnActions: false,
    enablePagination: true,
    enableRowActions: false,
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
        textTransform: 'uppercase',
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
