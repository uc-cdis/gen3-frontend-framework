import React from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { JSONObject } from '@gen3/core';
import type { ExplorerTableSubTableProps } from './types';

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
  });

  return <MantineReactTable table={table} />;
};

export default ExplorerTableSubTable;
