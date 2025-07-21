import React, { useCallback, useMemo, useState } from 'react';
import { useDeepCompareMemo } from 'use-deep-compare';
import {
  CoreState,
  isJSONValue,
  JSONObject,
  selectIndexFilters,
  useCoreSelector,
  useGetRawDataAndTotalCountsQuery,
} from '@gen3/core';
import {
  MantineReactTable,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_RowSelectionState,
  type MRT_SortingState,
  useMantineReactTable,
} from 'mantine-react-table';
import { TableIcons } from '../../../components/Tables/TableIcons';
import type { ExplorerTableProps, SummaryTable } from './types';
import { type TableDetailsPanelProps } from './ExploreTableDetails';
import { DetailsModal, DetailsDrawer } from '../../../components/Details';
import { createTableColumns } from './utils';
import SubtableStack from './SubTables/SubtableStack';
import { JSONPath } from 'jsonpath-plus';
import { StudyProvider } from '../../Study';
import QueryRowDetailsPanel from './ExploreTableDetails/QueryRowDetailsPanel';

const DEFAULT_PAGE_LIMIT_LABEL = 'Rows per Page (Limited to 10,0000):';
const DEFAULT_PAGE_LIMIT = 10000;

/**
 * Main table component for the explorer page. Fetches data from guppy using
 * useGetRawDataAndTotalCountsQuery() hook that leverages guppy core API slices
 *
 * @param index - Offset to use for fetching/displaying pages of rows
 * @param tableConfig - Inherited from ExplorerPageGetServerSideProps
 * @param accessibility - set the access level for the cohort data
 */
const ExplorerTable = ({
  index,
  tableConfig,
  accessibility,
  classNames,
  size = 'sm',
}: ExplorerTableProps) => {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const DetailsComponent = useMemo(
    () =>
      tableConfig?.detailsConfig?.panelContainer === 'drawer'
        ? DetailsDrawer<TableDetailsPanelProps>
        : DetailsModal<TableDetailsPanelProps>,
    [],
  );

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [selectedRow, setSelectedRow] = useState<
    MRT_Row<Record<string, any>> | undefined
  >(undefined);

  // const DetailsPanel = useMemo(
  //   () =>
  //     ExplorerTableDetailsPanelFactory().getRenderer(
  //       'tableDetails',
  //       tableConfig?.detailsConfig?.panel ?? 'default',
  //     ),
  //   [tableConfig?.detailsConfig?.panel],
  // );

  const DetailsPanel = useMemo(() => QueryRowDetailsPanel, []);

  const tableColumns = useDeepCompareMemo(() => {
    return createTableColumns(tableConfig);
  }, [tableConfig]);

  // TODO: add support for nested fields
  const fields = useMemo(
    () => tableColumns.map((column) => column.field),
    [tableColumns],
  );

  const getRowId = useCallback((tableConfig: SummaryTable) => {
    const { detailsConfig } = tableConfig || {};
    const idField: string | undefined = detailsConfig?.idField;
    if (!idField) return undefined;

    return (originalRow: JSONObject) => {
      const id = JSONPath({ json: originalRow, path: idField });

      if (id.length > 0) {
        return id[0];
      } else {
        return undefined;
      }
    };
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
      accessibility: accessibility,
    });

  const { totalRowCount, limitLabel } = useDeepCompareMemo(() => {
    const pageLimit =
      (tableConfig?.pageLimit && tableConfig?.pageLimit?.limit) ??
      DEFAULT_PAGE_LIMIT;
    const totalRowCount = tableConfig?.pageLimit
      ? Math.min(
          pageLimit,
          data?.data?._aggregation?.[index]._totalCount ?? pagination.pageSize,
        )
      : (data?.data?._aggregation?.[index]._totalCount ?? pagination.pageSize);
    const limitLabel = tableConfig?.pageLimit
      ? (tableConfig?.pageLimit?.label ?? DEFAULT_PAGE_LIMIT_LABEL)
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

  const table = useMantineReactTable<JSONObject>({
    columns: tableColumns as any[], //TODO: fix this
    data: data?.data?.[index] ?? [],
    manualSorting: true,
    manualPagination: true,
    enableStickyHeader: true,
    paginateExpandedRows: false,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableTopToolbar: false,
    enableExpanding: !!tableConfig?.detailsConfig,
    getRowId: getRowId(tableConfig),
    rowCount: totalRowCount,
    icons: TableIcons,
    paginationDisplayMode: 'pages',
    enableRowSelection: tableConfig?.selectableRows ?? false,
    localization: { rowsPerPage: limitLabel },
    mantineTableProps: {
      style: {
        backgroundColor: 'var(--mantine-color-base-1)',
        '--mrt-striped-row-background-color': 'var(--mantine-color-base-3)',
        fontSize: `var(--mantine-font-size-${size})`,
        zIndex: 10,
      },
    },
    mantinePaginationProps: {
      rowsPerPageOptions: ['5', '10', '20', '40', '100'],
      withEdges: false, //note: changed from `showFirstLastButtons` in v1.0
    },

    mantineTableHeadCellProps: {
      style: {
        '--mrt-base-background-color': 'var(--mantine-color-table-1)',
        color: `var(--mantine-color-table-contrast-5')`,
      },
      // sx: (theme) => {
      //   return {
      //     backgroundColor: theme.colors.table[1],
      //     color: theme.colors['table-contrast'][5],
      //     textAlign: 'center',
      //     padding: theme.spacing.md,
      //     fontWeight: 'bold',
      //     fontSize: theme.fontSizes.lg,
      //   };
      // },
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
                setSelectedRow(undefined);
              } else {
                setRowSelection({ [row.id as string]: true });
                setSelectedRow(row as any); // TODO: fix this typecast
              }
            },
            sx: {
              cursor: 'pointer', //you might want to change the cursor too when adding an onClick
            },
          })
        : {},
    renderDetailPanel:
      tableConfig.detailsConfig?.mode === 'expand' || tableConfig?.subTables
        ? ({ row }) => {
            const val = tableConfig?.subTables?.some((subTable) => {
              if (
                subTable.root in row.original &&
                isJSONValue(row.original[subTable.root])
              ) {
                return (
                  Object.values(row.original[subTable.root] as JSONObject)
                    .length > 0
                );
              } else return false;
            });
            if (tableConfig?.subTables && val) {
              return (
                <SubtableStack
                  subTables={tableConfig.subTables}
                  data={row.original ?? []}
                />
              );
            } else return null;
          }
        : undefined,
  });
  return (
    <React.Fragment>
      <StudyProvider>
        <DetailsComponent
          title={tableConfig?.detailsConfig?.title}
          id={
            Object.keys(rowSelection).length > 0
              ? Object.keys(rowSelection).at(0)
              : undefined
          }
          row={selectedRow}
          onClose={() => setRowSelection({})}
          panel={DetailsPanel}
          classNames={tableConfig?.detailsConfig?.classNames}
          panelProps={{
            index,
            tableConfig,
            ...(tableConfig?.detailsConfig?.params ?? {}),
            accessibility,
          }}
        />
        )
        <div className="inline-block overflow-x-scroll">
          <MantineReactTable table={table} />
        </div>
      </StudyProvider>
    </React.Fragment>
  );
};

export default ExplorerTable;
