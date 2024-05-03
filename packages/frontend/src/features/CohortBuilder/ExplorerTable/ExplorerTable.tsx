import React, { useMemo, useState } from 'react';
import { useDeepCompareCallback, useDeepCompareMemo } from 'use-deep-compare';
import {
  fieldNameToTitle,
  selectIndexFilters,
  useCoreSelector,
  useGetRawDataAndTotalCountsQuery,
} from '@gen3/core';
import {
  MantineReactTable,
  MRT_Column,
  type MRT_PaginationState,
  type MRT_SortingState,
  useMantineReactTable,
} from 'mantine-react-table';
import { jsonPathAccessor } from '../../../components/Tables/utils';

import { SummaryTable } from './types';
import {
  CellRendererFunction,
  ExplorerTableCellRendererFactory,
} from './ExplorerTableCellRenderers';
import { CellRendererFunctionProps } from '../../../utils/RendererFactory';

const DEFAULT_PAGE_LIMIT_LABEL = 'Rows per Page (Limited to 10,0000):';
const DEFAULT_PAGE_LIMIT = 10000;

const isRecordAny = (obj: unknown): obj is Record<string, any> => {
  if (Array.isArray(obj)) return false;

  return obj !== null && typeof obj === 'object';
};

interface ExplorerTableProps {
  index: string;
  tableConfig: SummaryTable;
}

interface ExplorerColumn {
  field: string;
  accessorKey: never;
  header: string;
  accessorFn?: (originalRow: ExplorerColumn) => any;
  Cell?: CellRendererFunction;
  size?: number;
}

/**
 * Main table component for the explorer page. Fetches data from guppy using
 * useGetRawDataAndTotalCountsQuery() hook that leverages guppy core API slices
 *
 * @param index - Offset to use for fetching/displaying pages of rows
 * @param tableConfig - Inherited from ExplorerPageGetServerSideProps
 */
const ExplorerTable = ({ index, tableConfig }: ExplorerTableProps) => {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const cols = useDeepCompareMemo(() => {
    // setup table columns at the same time
    // TODO: refactor to support more complex table configs
    return tableConfig.fields.map((field) => {
      const columnDef = tableConfig?.columns?.[field];

      const cellRendererFunc = columnDef?.type
        ? ExplorerTableCellRendererFactory().getRenderer(
            columnDef?.type,
            columnDef?.cellRenderFunction ?? 'default',
          )
        : undefined;

      const cellRendererFuncParams =
        columnDef?.params && isRecordAny(columnDef?.params)
          ? columnDef?.params
          : {};
      return {
        id: field,
        field: field,
        accessorKey: field as never,
        header: columnDef?.title ?? fieldNameToTitle(field),
        accessorFn: columnDef?.accessorPath
          ? jsonPathAccessor(columnDef.accessorPath)
          : undefined,
        Cell:
          cellRendererFunc && columnDef?.params
            ? (cell: CellRendererFunctionProps) =>
                cellRendererFunc(cell, cellRendererFuncParams)
            : cellRendererFunc,
        size: columnDef?.width,
      };
    }, [] as MRT_Column<ExplorerColumn>[]);
  }, [tableConfig]);

  // TODO: add support for nested fields
  const fields = useMemo(() => cols.map((column) => column.field), [cols]);

  const cohortFilters = useCoreSelector((state) =>
    selectIndexFilters(state, index),
  );

  const { data, isLoading, isError, isFetching, isSuccess } =
    useGetRawDataAndTotalCountsQuery({
      type: index,
      fields: fields,
      filters: cohortFilters,
      offset: pagination.pageIndex * pagination.pageSize,
      size: pagination.pageSize,
      sort:
        sorting.length > 0
          ? (sorting.map((x) => {
              return { [x.id]: x.desc ? 'desc' : 'asc' };
            }) as Record<string, 'desc' | 'asc'>[])
          : undefined,
    });

  const { totalRowCount, limitLabel } = useDeepCompareMemo(() => {
    const pageLimit =
      (tableConfig?.pageLimit && tableConfig?.pageLimit?.limit) ??
      DEFAULT_PAGE_LIMIT;
    const totalRowCount = tableConfig?.pageLimit
      ? Math.min(
          pageLimit,
          data?.data._aggregation?.[index]._totalCount ?? pagination.pageSize,
        )
      : data?.data._aggregation?.[index]._totalCount ?? pagination.pageSize;
    const limitLabel = tableConfig?.pageLimit
      ? tableConfig?.pageLimit?.label ?? DEFAULT_PAGE_LIMIT_LABEL
      : 'Rows per Page:';
    return { totalRowCount, limitLabel };
  }, [tableConfig, data, pagination.pageSize, index]);
  /**
   * mantine-react-table setup
   * @see https://www.mantine-react-table.com/docs/api/table-options
   * @param columns - column options table config
   *   @see https://www.mantine-react-table.com/docs/api/column-options
   * @param data - data array, from useGetRawDataAndTotalCountsQuery()
   * @param manualSorting - If this is true, you will be expected to sort your data before it is passed to the table.
   * @param manualPagination - If this is true, you will be expected to manually paginate the rows before passing them to the table
   * @param enableStickyHeader - TODO: not sure what this does
   * @param paginateExpandedRows - If true expanded rows will be paginated along with the rest of the table (which means expanded rows may span multiple pages)
   * @param onPaginationChange - If this function is provided, it will be called when the pagination state changes and you will be expected to manage the state yourself
   * @param onSortingChange - If provided, this function will be called with an updaterFn when variable state.sorting changes. Overrides default internal state management
   * @param enableTopToolbar - enables additional ux features
   * @param rowCount - Number of rows in the table
   * @param tableConfig - Inherited from ExplorerPageGetServerSideProps
   * @param {Partial<MRT_TableState<TData>>} state - State management configs
   *   @see https://www.mantine-react-table.com/docs/guides/state-management#manage-individual-states-as-needed
   */
  const table = useMantineReactTable({
    columns: cols,
    data: data?.data?.[index] ?? [],
    manualSorting: true,
    manualPagination: true,
    enableStickyHeader: true,
    paginateExpandedRows: false,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableTopToolbar: false,
    rowCount: totalRowCount,
    paginationDisplayMode: 'pages',
    localization: { rowsPerPage: limitLabel },
    mantinePaginationProps: {
      rowsPerPageOptions: ['5', '10', '20', '40', '100'],
      withEdges: false, //note: changed from `showFirstLastButtons` in v1.0
    },
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
    <div className="inline-block overflow-x-scroll">
      <MantineReactTable table={table} />
    </div>
  );
};

export default ExplorerTable;
