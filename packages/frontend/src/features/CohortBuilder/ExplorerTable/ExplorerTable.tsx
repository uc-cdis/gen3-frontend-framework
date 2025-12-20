import React, {
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDeepCompareMemo } from 'use-deep-compare';
import {
  Accessibility,
  CoreState,
  FilterSet,
  isJSONValue,
  JSONObject,
  selectIndexFilters,
  useCoreSelector,
  useGetRawDataAndTotalCountsQuery,
} from '@gen3/core';
import {
  MantineReactTable,
  type MRT_ColumnOrderState,
  type MRT_PaginationState,
  type MRT_Row,
  type MRT_RowSelectionState,
  type MRT_SortingState,
  useMantineReactTable,
} from 'mantine-react-table';
import { TableIcons } from '../../../components/Tables/TableIcons';
import {
  ExplorerTableProps,
  RowSelectionConfiguration,
  SimplifiedExplorerDataHook,
  SummaryTable,
} from './types';
import { type TableDetailsPanelProps } from './ExploreTableDetails';
import { DetailsDrawer, DetailsModal } from '../../../components/Details';
import { createTableColumns } from './utils';
import SubtableStack from './SubTables/SubtableStack';
import { JSONPath } from 'jsonpath-plus';
import { StudyProvider } from '../../Study';
import QueryRowDetailsPanel from './ExploreTableDetails/QueryRowDetailsPanel';
import TableHeader from '../../../components/Tables/TableHeader';
import { TableSearchOrPaginationProps } from '../../../components/Tables/types';
import { TableXPositionContext } from './context';
import { SingleItemAddToCartButton } from '../../cart/updateCart';
import { DetailsComponentProps } from '../../../components/Details/types';

const DEFAULT_PAGE_LIMIT_LABEL = 'Rows per Page (Limited to 10,0000):';
const DEFAULT_PAGE_LIMIT = 10000;

const processRowActions = (
  configuration: RowSelectionConfiguration | undefined,
) => {
  if (!configuration || configuration.enabled === false)
    return {
      enableRowActions: false,
    };

  if (configuration.action === 'cart') {
    return {
      enableRowActions: true,
      renderRowActions: ({ row }: { row: MRT_Row<JSONObject> }) => {
        const itemData = configuration?.itemFields?.reduce(
          (acc: Record<string, any>, key) => {
            if (key in row.original) acc[key] = row.original[key];
            return acc;
          },
          {},
        );
        return (
          <SingleItemAddToCartButton
            item={{
              id: row.id,
              ...itemData,
            }}
          />
        );
      },
    };
  }

  return { enableRowActions: false };
};

const DefaultDataResponse = {
  id: 'no-data',
  name: 'No Data',
  description: 'No Data',
};

// ... existing code ...
const useGetTableData = (
  index: string,
  fields: string[],
  filters: FilterSet,
  pagination: MRT_PaginationState,
  sorting: MRT_SortingState,
  accessibility: Accessibility,
  maxItems?: number,
  indexPrefix: string = '',
) => {
  const { pageIndex, pageSize } = pagination;

  const sort =
    sorting.length > 0
      ? (sorting.map((s) => ({ [s.id]: s.desc ? 'desc' : 'asc' })) as Record<
          string,
          'desc' | 'asc'
        >[])
      : undefined;

  const { data, isLoading, isError, isFetching, isSuccess } =
    useGetRawDataAndTotalCountsQuery({
      type: index,
      fields,
      filters,
      offset: pageIndex * pageSize,
      size: pageSize,
      sort,
      accessibility,
      indexPrefix,
    });

  const totalRowCount = useDeepCompareMemo(() => {
    const aggregationKey = `${indexPrefix}_aggregation`;
    const fetchedTotal =
      data?.data?.[aggregationKey]?.[index]?._totalCount ?? pageSize;
    const pageLimit = maxItems ?? DEFAULT_PAGE_LIMIT;

    return pageLimit ? Math.min(pageLimit, fetchedTotal) : fetchedTotal;
  }, [maxItems, data, pageSize, index, indexPrefix]);

  return {
    data: data?.data?.[`${indexPrefix}${index}`] ?? [
      {
        id: 'no-data',
        name: 'No Data',
        description: 'No Data',
      },
    ],
    totalRowCount,
    isLoading,
    isError,
    isFetching,
    isSuccess,
  };
};

const ExplorerTable = ({
  index,
  tableConfig,
  accessibility,
  classNames,
  size = 'sm',
  additionalControls,
  tableTotalDetail,
  tableTitle,
  indexPrefix = '',
  dataHook = useGetRawDataAndTotalCountsQuery,
}: ExplorerTableProps) => {
  const cohortFilters = useCoreSelector((state: CoreState) =>
    selectIndexFilters(state, index),
  );

  const { tableColumns } = useDeepCompareMemo(() => {
    return createTableColumns(tableConfig);
  }, [tableConfig]);

  const fields = useMemo(
    () => tableColumns.map((column) => column.field),
    [tableColumns],
  );

  const DetailsPanel = useMemo(() => QueryRowDetailsPanel, []);

  const DetailsComponentWrapper = useMemo(() => {
    if (
      !tableConfig?.detailsConfig ||
      !tableConfig?.detailsConfig?.panel ||
      tableConfig?.detailsConfig?.mode === 'none'
    )
      return null;

    const BaseComponent =
      tableConfig?.detailsConfig?.panelContainer === 'drawer'
        ? DetailsDrawer<TableDetailsPanelProps>
        : DetailsModal<TableDetailsPanelProps>;

    const WrappedDetailsComponent = ({
      id,
      row,
      onClose,
    }: Pick<DetailsComponentProps, 'id' | 'row' | 'onClose'>) => (
      <BaseComponent
        title={tableConfig?.detailsConfig?.title}
        id={id}
        row={row}
        onClose={onClose}
        panel={DetailsPanel}
        classNames={tableConfig?.detailsConfig?.classNames}
        panelProps={{
          index,
          tableConfig,
          ...(tableConfig?.detailsConfig?.params ?? {}),
          accessibility,
        }}
      />
    );
    WrappedDetailsComponent.displayName = 'WrappedDetailsComponent';
    return WrappedDetailsComponent;
  }, [tableConfig, index, accessibility, DetailsPanel]);

  const useSimplifiedData: SimplifiedExplorerDataHook = ({
    pagination,
    sorting,
    accessibility,
  }) => {
    const { pageIndex, pageSize } = pagination;
    const sort = useMemo(
      () =>
        sorting.length > 0
          ? (sorting.map((x) => ({
              [x.id]: x.desc ? 'desc' : 'asc',
            })) as Record<string, 'desc' | 'asc'>[])
          : undefined,
      [sorting],
    );

    const { data, isLoading, isError, isFetching, isSuccess } = dataHook({
      type: index,
      fields: fields,
      filters: cohortFilters,
      offset: pageIndex * pageSize,
      size: pageSize,
      sort,
      accessibility,
      indexPrefix: indexPrefix,
    });

    const { totalRowCount, limitLabel } = useDeepCompareMemo(() => {
      const pageLimit = tableConfig?.pageLimit?.limit ?? DEFAULT_PAGE_LIMIT;
      const aggregationKey = `${indexPrefix}_aggregation`;
      const fetchedTotal =
        data?.data?.[aggregationKey]?.[index]?._totalCount ?? pageSize;

      const totalCount = tableConfig?.pageLimit
        ? Math.min(pageLimit, fetchedTotal)
        : fetchedTotal;

      const label = tableConfig?.pageLimit
        ? (tableConfig?.pageLimit?.label ?? DEFAULT_PAGE_LIMIT_LABEL)
        : 'Rows per Page:';

      return { totalRowCount: totalCount, limitLabel: label };
    }, [data, pageSize]);

    const tableData = useMemo(() => {
      return data?.data?.[`${indexPrefix}${index}`] ?? [DefaultDataResponse];
    }, [data]);

    return {
      data: tableData,
      totalRowCount,
      limitLabel,
      isLoading,
      isError,
      isFetching,
      isSuccess,
    };
  };

  return (
    <ExplorerDataTable
      tableConfig={tableConfig}
      accessibility={accessibility}
      classNames={classNames}
      size={size}
      additionalControls={additionalControls}
      tableTotalDetail={tableTotalDetail}
      DetailsComponent={DetailsComponentWrapper}
      tableTitle={tableTitle}
      dataHook={useSimplifiedData}
    />
  );
};

/**
 * Main table component for the explorer page. Fetches data from guppy using
 * the provided dataHook.
 */
const ExplorerDataTable = ({
  tableConfig,
  accessibility,
  classNames,
  size = 'sm',
  additionalControls,
  tableTotalDetail,
  tableTitle,
  dataHook,
  DetailsComponent,
}: Omit<ExplorerTableProps, 'dataHook' | 'index'> & {
  dataHook: SimplifiedExplorerDataHook;
  DetailsComponent: React.ComponentType<
    Pick<DetailsComponentProps, 'id' | 'row' | 'onClose'>
  > | null;
}) => {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const ref = useRef<HTMLDivElement | null>(null);

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [selectedRow, setSelectedRow] = useState<
    MRT_Row<Record<string, any>> | undefined
  >(undefined);
  const { tableColumns, lockedVisibility } = useDeepCompareMemo(() => {
    return createTableColumns(tableConfig);
  }, [tableConfig]);
  const [columnVisibility, setColumnVisibility] = useState(lockedVisibility);

  // const DetailsPanel = useMemo(
  //   () =>
  //     ExplorerTableDetailsPanelFactory().getRenderer(
  //       'tableDetails',
  //       tableConfig?.detailsConfig?.panel ?? 'default',
  //     ),
  //   [tableConfig?.detailsConfig?.panel],
  // );

  const handleColumnVisibilityChange = (updater: any) => {
    const newState =
      typeof updater === 'function' ? updater(columnVisibility) : updater;

    setColumnVisibility({
      ...{
        ...newState,
        'mrt-row-expand': false,
        'mrt-row-actions': true,
        ...lockedVisibility,
      },
    });
  };

  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(
    tableColumns.map((column: any) => column.id as string), //must start out with populated columnOrder so we can splice
  );

  const handleSearchOrPageChange = useCallback(
    (params: TableSearchOrPaginationProps) => null,
    [],
  );

  const getRowId = useCallback((tableConfig: SummaryTable) => {
    const { detailsConfig } = tableConfig || {};
    const detailsIdField: string | undefined = detailsConfig?.idField; // Old Way
    const rowIdField: string | undefined = tableConfig?.rowIdField;
    if (!detailsIdField && !rowIdField) return undefined;
    const idField = rowIdField ?? detailsIdField;
    if (idField === undefined) return undefined;

    return (originalRow: JSONObject) => {
      const id = JSONPath({ json: originalRow, path: idField });
      if (id.length > 0) {
        return id[0];
      } else {
        return undefined;
      }
    };
  }, []);

  const { xPosition, setXPosition } = useContext(TableXPositionContext);

  const {
    data,
    totalRowCount,
    limitLabel,
    isLoading,
    isError,
    isFetching,
    isSuccess,
  } = dataHook({
    pagination,
    sorting,
    accessibility,
  });

  const rowActions = useDeepCompareMemo(
    () => processRowActions(tableConfig?.selectableRowsConfiguration),

    [tableConfig?.selectableRowsConfiguration],
  );

  /**
   * mantine-react-table setup
   * @see https://www.mantine-react-table.com/docs/api/table-options
   * @param columns - column options table config
   *   @see https://www.mantine-react-table.com/docs/api/column-options
   * @param data - data array, from useGetRawDataAndTotalCountsQuery()
   * @param manualSorting - If this is true, you will be expected to sort your data before it is passed to the table.
   * @param manualPagination - If this is true, you will be expected to manually paginate the rows before passing them to the table
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
    data: data,
    manualSorting: true,
    manualPagination: true,
    enableStickyHeader: true,
    enableColumnFilters: false,
    paginateExpandedRows: false,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableTopToolbar: false,
    enableExpandAll: false,
    enableHiding: true,
    displayColumnDefOptions: {
      'mrt-row-expand': {
        enableHiding: true, //now row numbers are hideable too
      },
      ...(tableConfig?.selectableRowsConfiguration?.enabled &&
      tableConfig?.selectableRowsConfiguration?.action === 'cart'
        ? { 'mrt-row-actions': { header: 'Cart', enableHiding: false } } // TODO: make this configurable but for now we will never hide this column
        : {}),
    },
    onColumnVisibilityChange: handleColumnVisibilityChange,
    enableExpanding: !!tableConfig?.detailsConfig,
    //enableColumnOrdering: tableConfig?.columnSorting,
    // enableHiding: tableConfig?.columnHiding,
    getRowId: getRowId(tableConfig),
    rowCount: totalRowCount,
    icons: TableIcons,
    paginationDisplayMode: 'pages',
    localization: { rowsPerPage: limitLabel },

    // mantineExpandAllButtonProps: {
    //   style: {
    //     visibility: 'hidden',
    //   },
    // },
    // mantineExpandButtonProps: {
    //   style: {
    //     visibility: 'hidden',
    //   },
    // },
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
      columnVisibility: columnVisibility, //{ 'mrt-row-expand': false, ...lockedVisibility },
      columnOrder: [
        'mrt-row-expand',
        'mrt-row-number',
        'mrt-row-selection',
        'mrt-row-actions',
        ...columnOrder,
      ],
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
    ...rowActions,
    // ...processRowActions(
    //   tableConfig?.selectableRowsConfiguration,
    // ),
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

  const rowCount = table.getRowModel().rows.length;

  useLayoutEffect(() => {
    if (
      setXPosition &&
      xPosition === undefined &&
      isSuccess &&
      rowCount > 0 &&
      ref.current
    ) {
      setXPosition(ref?.current?.getBoundingClientRect()?.bottom);
    }
  }, [setXPosition, xPosition, rowCount]);

  return (
    <React.Fragment>
      <StudyProvider>
        {DetailsComponent && (
          <DetailsComponent
            id={
              Object.keys(rowSelection).length > 0
                ? Object.keys(rowSelection).at(0)
                : undefined
            }
            row={selectedRow}
            onClose={() => setRowSelection({})}
          />
        )}
        <div className="inline-block overflow-x-scroll " ref={ref}>
          {(tableConfig?.showTableHeaderControls ||
            tableConfig.columnSorting ||
            tableConfig?.columnHiding) && (
            <TableHeader
              table={table}
              columnOrder={columnOrder}
              setColumnOrder={setColumnOrder}
              handleChange={handleSearchOrPageChange}
              additionalControls={additionalControls}
              tableTitle={tableTitle}
              tableTotalDetail={tableTotalDetail}
              showControls={tableConfig?.showTableHeaderControls}
              noColumnOrdering={Object.keys(lockedVisibility)}
            />
          )}
          <MantineReactTable table={table} />
        </div>
      </StudyProvider>
    </React.Fragment>
  );
};

export default ExplorerTable;
