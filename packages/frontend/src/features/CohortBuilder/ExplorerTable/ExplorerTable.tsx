import React, { useCallback, useMemo, useState } from 'react';
import { useDeepCompareMemo } from 'use-deep-compare';
import {
  Accessibility,
  CoreState,
  fieldNameToTitle,
  JSONObject,
  selectIndexFilters,
  useCoreSelector,
  useGetRawDataAndTotalCountsQuery,
} from '@gen3/core';
import {
  MantineReactTable,
  type MRT_Column,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_RowSelectionState,
  type MRT_SortingState,
  useMantineReactTable,
} from 'mantine-react-table';
import { jsonPathAccessor } from '../../../components/Tables/utils';
import { TableIcons } from '../../../components/Tables/TableIcons';
import {
  ExplorerTableProps,
  SummaryTable,
  CellRendererFunctionProps,
} from './types';
import {
  CellRendererFunction,
  ExplorerTableCellRendererFactory,
} from './ExplorerTableCellRenderers';
import {
  ExplorerTableDetailsPanelFactory,
  type TableDetailsPanelProps,
} from './ExploreTableDetails';
import { DetailsModal } from '../../../components/Details';

const DEFAULT_PAGE_LIMIT_LABEL = 'Rows per Page (Limited to 10,0000):';
const DEFAULT_PAGE_LIMIT = 10000;

const isRecordAny = (obj: unknown): obj is Record<string, any> => {
  if (Array.isArray(obj)) return false;

  return obj !== null && typeof obj === 'object';
};

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

  const DetailsComponent = DetailsModal<TableDetailsPanelProps>;

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  const DetailsPanel = useMemo(
    () =>
      ExplorerTableDetailsPanelFactory().getRenderer(
        'tableDetails',
        tableConfig?.detailsConfig?.panel ?? 'default',
      ),
    [],
  );

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
        enableSorting: columnDef?.sortable ?? undefined,
      };
    }, [] as MRT_Column<ExplorerColumn>[]);
  }, [tableConfig]);

  // TODO: add support for nested fields
  const fields = useMemo(() => cols.map((column) => column.field), [cols]);

  const getRowId = useCallback((tableConfig: SummaryTable) => {
    const { detailsConfig } = tableConfig || {};
    const idField: string | undefined = detailsConfig?.idField;
    return (
      originalRow: JSONObject,
      _index: number,
      _parentRow: MRT_Row<JSONObject>,
    ) =>
      idField && Object.keys(originalRow).includes(idField)
        ? (originalRow[idField] as string)
        : undefined;
  }, []);

  const cohortFilters = useCoreSelector((state: CoreState) =>
    selectIndexFilters(state, index),
  );

  const { data, isLoading, isError, isFetching } =
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
      accessibility: Accessibility.ACCESSIBLE,
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
0.
   * @param paginateExpandedRows - If true expanded rows will be paginated along with the rest of the table (which means expanded rows may span multiple pages)      -
   * @param onPaginationChange - If this function is provided, it will be called when the pagination state changes and you will be expected to manage the state yourself
   * @param onSortingChange - If provided, this function will be called with an updaterFn when variable state. sorting changes. Overrides default internal state management
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
    getRowId: getRowId(tableConfig),
    rowCount: totalRowCount,
    icons: TableIcons,
    paginationDisplayMode: 'pages',
    enableRowSelection: tableConfig?.selectableRows ?? false,
    localization: { rowsPerPage: limitLabel },
    mantinePaginationProps: {
      rowsPerPageOptions: ['5', '10', '20', '40', '100'],
      withEdges: false, //note: changed from `showFirstLastButtons` in v1.0
    },
    mantineTableHeadCellProps: {
      sx: (theme) => {
        return {
          backgroundColor: theme.colors.table[1],
          color: theme.colors['table-contrast'][5],
          textAlign: 'center',
          padding: theme.spacing.md,
          fontWeight: 'bold',
          fontSize: theme.fontSizes.lg,
        };
      },
    },
    state: {
      isLoading,
      pagination,
      sorting,
      showProgressBars: isFetching,
      showAlertBanner: isError,
      density: 'xs',
      rowSelection: rowSelection,
    },
    mantineTableBodyRowProps:
      tableConfig.detailsConfig?.mode === 'click'
        ? ({ row }) => ({
            onClick: () => {
              if (Object.keys(rowSelection).includes(row.id)) {
                setRowSelection({});
              } else {
                setRowSelection({ [row.id as string]: true });
              }
            },
            sx: {
              cursor: 'pointer', //you might want to change the cursor too when adding an onClick
            },
          })
        : {},
  });
  return (
    <React.Fragment>
      {Object.keys(rowSelection).length > 0 ? (
        <DetailsComponent
          title={tableConfig?.detailsConfig?.title}
          id={
            Object.keys(rowSelection).length > 0
              ? Object.keys(rowSelection).at(0)
              : undefined
          }
          onClose={() => setRowSelection({})}
          panel={DetailsPanel}
          classNames={tableConfig?.detailsConfig?.classNames}
          panelProps={{
            index,
            tableConfig,
            ...(tableConfig?.detailsConfig?.params ?? {}),
          }}
        />
      ) : null}

      <div className="inline-block overflow-x-scroll">
        <MantineReactTable table={table} />
      </div>
    </React.Fragment>
  );
};

export default ExplorerTable;
