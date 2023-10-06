'use client';
import React, { useMemo, useState } from 'react';
import {
  fieldNameToTitle,
  selectIndexFilters,
  SummaryTable,
  useCoreSelector,
  useGetRawDataAndTotalCountsQuery,
} from '@gen3/core';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_SortingState,
  type MRT_PaginationState,
} from 'mantine-react-table';
import { jsonPathAccessor } from './utils';
import { TableCellRenderer } from './CellRenderers';

interface ExplorerTableProps {
  index: string;
  tableConfig: SummaryTable;
}

const ExplorerTable: React.FC<ExplorerTableProps> = ({
  index,
  tableConfig,
}: ExplorerTableProps) => {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const cols = useMemo(() => {
    // setup table columns at the same time
    // TODO: refactor to support more complex table configs
    const cols = tableConfig.fields.map((field) => {
      const columnDef = tableConfig.columns?.[field];
      return {
        field: field,
        accessorKey: field as never,
        header: columnDef?.title ?? fieldNameToTitle(field),
        accessorFn: columnDef?.accessorPath
          ? jsonPathAccessor(columnDef.accessorPath)
          : undefined,
        Cell: columnDef?.type
          ? TableCellRenderer(
              columnDef?.type,
              columnDef?.cellRenderFunction ?? 'default',
              columnDef?.params,
            )
          : undefined,
        size: columnDef?.width,
      };
    });
    return cols;
  }, [tableConfig]);

  // TODO: add support for nested fields
  const fields = useMemo(() => cols.map((column) => column.field), [cols]);
  const cohortFilters = useCoreSelector((state) =>
    selectIndexFilters(state, index),
  );

  const { data, isLoading, isError, isFetching } =
    useGetRawDataAndTotalCountsQuery({
      type: index,
      fields: fields,
      filters: cohortFilters,
      offset: pagination.pageIndex,
      size: pagination.pageSize,
      sort:
        sorting.length > 0
          ? (sorting.map((x) => {
              return { [x.id]: x.desc ? 'desc' : 'asc' };
            }) as Record<string, 'desc' | 'asc'>[])
          : undefined,
    });

  const table = useMantineReactTable({
    columns: cols,
    data: data?.data?.[index] ?? [],
    manualSorting: true,
    manualPagination: true,
    enableStickyHeader: true,
    paginateExpandedRows: false,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount: data?.data._aggregation?.[index]._totalCount ?? 0,
    state: {
      isLoading,
      pagination,
      sorting,
      showProgressBars: isFetching,
      showAlertBanner: isError,
      density: 'xs',
    },
  });

  return (
    <div className="w-auto inline-block overflow-x-scroll">
      <MantineReactTable table={table} />
    </div>
  );
};

export default ExplorerTable;
