import React from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { JSONObject } from '@gen3/core';
import type { ExplorerTableSubTableProps } from './types';
import { TableIcons } from '../../../../components/Tables/TableIcons';

const ExplorerTableSubTable = ({
  columns,
  data,
}: ExplorerTableSubTableProps) => {
  const table = useMantineReactTable<JSONObject>({
    columns: columns,
    data: data ?? [],
    enablePagination: false,
    enableTableFooter: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    getRowCanExpand: (row) => Object.keys(row).length > 0,
    icons: TableIcons,
    layoutMode: 'grid-no-grow',
    defaultColumn: {
      minSize: 300, //allow columns to get smaller than default
      maxSize: 1000, //allow columns to get larger than default
      size: 360, //make columns wider by default
    },
    mantineTableHeadProps: {
      style: {
        '--mrt-base-background-color': 'var(--mantine-color-primary-3)',
      },
    },
    mantineTableHeadCellProps: {
      style: {
        '--mrt-base-background-color': 'var(--mantine-color-primary-3)',
        color: `var(--mantine-color-table-contrast-5')`,
        padding: '0.2rem',
        paddingLeft: '1.5rem',
        borderRight: '1px solid var(--mantine-color-table-1)',
      },
    },
  });

  return <MantineReactTable table={table} />;
};

export default ExplorerTableSubTable;
