import React, { useMemo, useState } from 'react';
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
import { CellRendererFunction } from './CellRenderers';

import { SummaryTable } from './types';
import ExplorerTableRendererFactory, { CellRendererFunctionProps } from "./ExplorerTableCellRenderers";

const isRecordAny  = (obj: unknown): obj is Record<string, any> => {
  if (Array.isArray(obj))
    return false;

  if (obj !== null && typeof obj === "object") {
    return true;
  }

  return false;
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
  Cell?: CellRendererFunction ;
  size?: number;
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
    return tableConfig.fields.map((field) => {
      const columnDef = tableConfig?.columns?.[field];

      const cellRendererFunc = columnDef?.type ? ExplorerTableRendererFactory().getRenderer(
            columnDef?.type,
            columnDef?.cellRenderFunction ?? 'default',
          )
          : undefined;

      const cellRendererFuncParams =  columnDef?.params && isRecordAny(columnDef?.params) ? Object.entries(columnDef?.params) :  [];
      return {
        id: field,
        field: field,
        accessorKey: field as never,
        header: columnDef?.title ?? fieldNameToTitle(field),
        accessorFn: columnDef?.accessorPath
          ? jsonPathAccessor(columnDef.accessorPath)
          : undefined,
        Cell:  cellRendererFunc && columnDef?.params ? (cell : CellRendererFunctionProps) => cellRendererFunc(cell , cellRendererFuncParams  ) : cellRendererFunc,
        size: columnDef?.width,
      };
    }, [] as MRT_Column<ExplorerColumn>[]);
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
