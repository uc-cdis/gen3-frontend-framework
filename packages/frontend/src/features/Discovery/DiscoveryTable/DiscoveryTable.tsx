import React, { useEffect, useState } from 'react';
import type {
  MRT_Cell,
  MRT_ColumnDef,
  MRT_Row,
  MRT_RowData,
  MRT_SortingFn,
  MRT_SortingFns,
} from 'mantine-react-table-open';
import {
  MantineReactTable,
  type MRT_PaginationState,
  type MRT_RowSelectionState,
  type MRT_SortingState,
  useMantineReactTable,
} from 'mantine-react-table-open';
import { Loader, LoadingOverlay, Text } from '@mantine/core';
import { useDeepCompareEffect, useDeepCompareMemo } from 'use-deep-compare';
import { getManualSortingAndPagination, jsonPathAccessor } from '../utils';
import { DiscoveryTableCellRenderer } from './TableRenderers/CellRendererFactory';
import { useDiscoveryContext } from '../DiscoveryProvider';
import { useStudyContext } from '../../Study/StudyProvider';
import StudyDetails from '../../Study/StudyDetails/StudyDetails';
import type { CellRendererFunction } from './TableRenderers/types';
import type { JSONObject } from '@gen3/core';
import { TableIcons } from '../../../components/Tables/TableIcons';
import type {
  OnChangeFn,
  PaginationState,
  SortingState,
} from '@tanstack/table-core';
import type {
  DataRequestStatus,
  DiscoveryIndexConfig,
  RowSelectCompareFunctions,
  SelectableRowConfiguration,
} from '../types';
import HighlightSearchTerm from './SearchHighlighting/HighlightSearchTerm';
import RowDetailPanel from './TableRenderers/RowDetailPanel';
import { IsColumnSearchable } from './SearchHighlighting/IsColumnSearchable';
import DataAccessFilterDropdown from './DataAccessFilterDropdown';
import { createNumericSort, defaultStringSort } from './sorting';

const CompareFn = (
  fieldValue: string,
  cmpOp: RowSelectCompareFunctions,
  value?: string | number,
) => {
  switch (cmpOp) {
    case 'alwaysTrue':
      return true;
    case 'arrayNotEmpty':
      return Array.isArray(fieldValue) && fieldValue.length > 0;
  }
};

const getSortingFunction = <TData extends MRT_RowData>(
  type?: string,
): keyof typeof MRT_SortingFns | MRT_SortingFn<TData> => {
  if (!type) return defaultStringSort();
  if (type === 'number') return createNumericSort();
  return defaultStringSort();
};

const isSelectable = (
  row: MRT_RowData,
  config?: SelectableRowConfiguration,
) => {
  if (!config) return false;
  if (!Object.hasOwn(row.original, config.field)) return false;
  const fieldValue = row.original[config.field];
  return CompareFn(fieldValue, config.comparer, config.value);
};

interface DiscoveryTableProps {
  data: Array<Record<string, any>>;
  hits: number;
  studyIdFromWindow?: string;
  dataRequestStatus: DataRequestStatus;
  pagination: MRT_PaginationState;
  sorting: MRT_SortingState;
  setPagination: OnChangeFn<PaginationState>;
  setSorting: OnChangeFn<SortingState>;
  setSelection: (selection: Array<string>) => void;
  searchTerm: string;
  selectedFieldsForSearchIndexing: string[];
  discoveryConfig: DiscoveryIndexConfig;
}
const DiscoveryTable = ({
  data,
  hits,
  studyIdFromWindow,
  dataRequestStatus,
  setSorting,
  setPagination,
  setSelection,
  pagination,
  sorting,
  searchTerm,
  selectedFieldsForSearchIndexing,
  discoveryConfig,
}: DiscoveryTableProps) => {
  const { discoveryConfig: config } = useDiscoveryContext();
  const { setStudyDetails } = useStudyContext();
  const { isLoading, isError, isFetching } = dataRequestStatus;
  const manualSortingAndPagination = getManualSortingAndPagination(config);
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({}); //ts type available
  const size = discoveryConfig.tableConfig.size || 'sm';

  useEffect(() => {
    if (!studyIdFromWindow || !data) return;
    const uidKey = config.minimalFieldMapping.uid;
    if (Array.isArray(data)) {
      const foundStudy = data.find(
        (item) => item[uidKey] === studyIdFromWindow,
      );
      if (foundStudy) setStudyDetails(foundStudy);
    }
  }, [
    studyIdFromWindow,
    data,
    setStudyDetails,
    config.minimalFieldMapping.uid,
  ]);

  const extractCellValue =
    (func: CellRendererFunction) =>
    ({
      cell,
      row,
    }: {
      cell: MRT_Cell<JSONObject>;
      row: MRT_Row<MRT_RowData>;
    }) => {
      return IsColumnSearchable(
        cell.column,
        discoveryConfig,
        selectedFieldsForSearchIndexing,
      )
        ? func({
            value: HighlightSearchTerm(
              (cell.getValue() as string[])[0] as string,
              searchTerm,
            ),
          })
        : func({ value: cell.getValue() as never, cell, row });
    };

  // TODO: Note when adding serverside sorting, filtering, and pagination this config will need to be updated
  const cols = useDeepCompareMemo(() => {
    const studyColumns = config.studyColumns ?? [];
    return studyColumns.map((columnDef, idx) => {
      const sortingFn = getSortingFunction(columnDef?.contentType);
      const isDataAccessFilter = columnDef?.contentType === 'dataAccess';
      return {
        key: `${columnDef.field}-${idx}`,
        field: columnDef.field,
        accessorKey: columnDef.field,
        header: columnDef.name,
        Header: (
          <>
            {columnDef.name}
            {isDataAccessFilter && <DataAccessFilterDropdown />}
          </>
        ),
        accessorFn: jsonPathAccessor(columnDef.field),
        enableSorting: columnDef.sortable ?? true,
        sortingFn: sortingFn,
        Cell: columnDef.contentType
          ? extractCellValue(
              DiscoveryTableCellRenderer(
                columnDef?.contentType,
                columnDef?.cellRenderFunction ?? 'default',
                {
                  ...columnDef?.params,
                  size: size,
                  valueIfNotAvailable: columnDef?.valueIfNotAvailable ?? '',
                },
              ),
            )
          : extractCellValue(
              DiscoveryTableCellRenderer(
                'string',
                columnDef.cellRenderFunction ?? 'default',
                {
                  ...columnDef.params,
                  size: size,
                  valueIfNotAvailable: columnDef.valueIfNotAvailable ?? '',
                },
              ),
            ),
      } as MRT_ColumnDef<any>;
    });
  }, [config.studyColumns, searchTerm, selectedFieldsForSearchIndexing]);

  const checkIfRowIsSelectable = (row: MRT_RowData) => {
    if (config.tableConfig?.selectableRows) return true;
    if (config.tableConfig?.selectableRowConfiguration) {
      return isSelectable(row, config.tableConfig.selectableRowConfiguration);
    }
    return false;
  };

  const table = useMantineReactTable({
    columns: cols as any[],
    data: data ?? [],
    manualSorting: manualSortingAndPagination,
    manualPagination: manualSortingAndPagination,
    paginateExpandedRows: false,
    ...(manualSortingAndPagination
      ? {
          onPaginationChange: setPagination,
          onSortingChange: setSorting,
        }
      : {}),
    enableRowSelection: checkIfRowIsSelectable,
    rowCount: hits,
    icons: TableIcons,
    enableTopToolbar: false,
    enableColumnFilters: false,
    enableColumnActions: false,
    enableStickyHeader: true,
    enableStickyFooter: true,
    getRowId: (originalRow) =>
      config?.minimalFieldMapping?.uid &&
      config.minimalFieldMapping.uid in originalRow
        ? originalRow[config.minimalFieldMapping.uid]
        : (originalRow?.id ?? undefined),
    renderDetailPanel: ({ row }) => (
      <RowDetailPanel row={row} searchTerm={searchTerm} />
    ),
    onRowSelectionChange: setRowSelection,
    state: {
      density: 'xs',
      rowSelection,
      isLoading,
      ...(manualSortingAndPagination
        ? {
            pagination,
            sorting,
          }
        : {}),
      showProgressBars: isFetching,
      showAlertBanner: isError,
      expanded: config.tableConfig.expandableRows === true ? true : undefined,
      columnVisibility: {
        'mrt-row-expand': false,
      },
    },
    layoutMode: 'grid',
    mantineDetailPanelProps: {
      style: {
        boxShadow: '0 -2px 0px 0px var(--table-border-color) inset',
        width: '100%',
        fontSize: `var(--mantine-font-size-${size})`,
      },
    },
    mantineTableHeadCellProps: {
      style: {
        backgroundColor: 'var(--mantine-color-table-1)',
        color: 'var(--mantine-color-table-contrast-1)',
        textAlign: 'center',
        padding: 'var(--mantine-spacing-md)',
        fontWeight: 600,
        fontSize: `var(--mantine-font-size-${size})`,
        textTransform: 'uppercase',
      },
    },
    mantineSelectCheckboxProps: ({ row }) => ({
      title: 'Click to select item for download or open in workspace',
    }),
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        setStudyDetails(() => {
          return { ...row.original };
        });
      },
      style: {
        borderWidth: 0,
        fontSize: `var(--mantine-font-size-${size})`,
      },
    }),
    mantineTableProps: {
      style: {
        backgroundColor: 'var(--mantine-color-base-1)',
        '--mrt-striped-row-background-color': 'var(--mantine-color-base-3)',
        width: '100%',
        fontSize: `var(--mantine-font-size-${size})`,
      },
    },
    mantineTableBodyCellProps: {
      style: {
        fontSize: `var(--mantine-font-size-${size})`,
        wrap: 'break-word',
      },
    },
  });

  useDeepCompareEffect(() => {
    //fetch data based on row selection state
    setSelection(rowSelection ? Object.keys(rowSelection) : []);
  }, [rowSelection, setSelection]);

  if (dataRequestStatus.isLoading) {
    return (
      <div className="flex w-full py-24 relative justify-center">
        <Loader variant="dots" />
      </div>
    );
  }
  if (dataRequestStatus.isError) {
    return (
      <div className="flex w-full py-24 h-100 relative justify-center">
        <Text size="xl">Error loading discovery data</Text>
      </div>
    );
  }
  return (
    <React.Fragment>
      <StudyDetails />
      <div className="grow w-auto inline-block overflow-x-scroll">
        <LoadingOverlay visible={dataRequestStatus.isLoading} />
        <MantineReactTable table={table} />
      </div>
    </React.Fragment>
  );
};

export default DiscoveryTable;
