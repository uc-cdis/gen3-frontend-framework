import React, { useCallback, useMemo, useState } from 'react';
import { useDeepCompareMemo } from 'use-deep-compare';
import {
  TableColumnsAndFields,
  SummaryTableColumn,
  FieldSubtable,
} from '../types';
import { createTableColumns } from '../utils';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { JSONObject } from '@gen3/core';

interface ExplorerTableSubTableProps {
  config: FieldSubtable;
  data?: JSONObject[];
}

const ExplorerTableSubTable = ({
  config,
  data,
}: ExplorerTableSubTableProps) => {
  const tableColumns = useDeepCompareMemo(() => {
    return createTableColumns(config);
  }, [config]);

  const table = useMantineReactTable<JSONObject>({
    columns: tableColumns as any[], //TODO: fix this
    data: data ?? [],
    enablePagination: false,
    enableTableFooter: false,
    enableTopToolbar: false,
  });

  return <MantineReactTable table={table} />;
};

export default ExplorerTableSubTable;
