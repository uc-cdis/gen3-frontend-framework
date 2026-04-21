import React, { SetStateAction, useEffect, useRef, useState } from 'react';
import {
  MantineReactTable,
  MRT_Cell,
  type MRT_PaginationState,
  MRT_Row,
  MRT_RowData,
  type MRT_RowSelectionState,
  type MRT_SortingState,
  useMantineReactTable,
} from 'mantine-react-table';
import { Loader, LoadingOverlay, Text } from '@mantine/core';
import { useDeepCompareEffect, useDeepCompareMemo } from 'use-deep-compare';
import { getManualSortingAndPagination, jsonPathAccessor } from '../utils';
import { DiscoveryTableCellRenderer } from './TableRenderers/CellRendererFactory';
import { useDiscoveryContext } from '../DiscoveryProvider';
import { useStudyContext } from '../../Study/StudyProvider';
import StudyDetails from '../../Study/StudyDetails/StudyDetails';
import { CellRendererFunction } from './TableRenderers/types';
import { JSONObject } from '@gen3/core';
import { TableIcons } from '../../../components/Tables/TableIcons';
import {
  OnChangeFn,
  PaginationState,
  SortingState,
} from '@tanstack/table-core';
import {
  DataRequestStatus,
  DiscoveryIndexConfig,
  RowSelectCompareFunctions,
  SelectableRowConfiguration,
} from '../types';
import HighlightSearchTerm from './SearchHighlighting/HighlightSearchTerm';
import RowDetailPanel from './TableRenderers/RowDetailPanel';
import { IsColumnSearchable } from './SearchHighlighting/IsColumnSearchable';

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

  useEffect(() => {
    if (!studyIdFromWindow || !data) return;

    const uidKey = '_hdp_uid';
    const foundStudy = Array.isArray(data)
      ? data.find((item) => item[uidKey] === studyIdFromWindow)
      : data && data[uidKey] === studyIdFromWindow
        ? data
        : undefined;

    if (foundStudy) {
      setStudyDetails(foundStudy);
    }
  }, [studyIdFromWindow, data]);

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

  const cols = useDeepCompareMemo(() => {
    const studyColumns = config.studyColumns ?? [];
    return studyColumns.map((columnDef, idx) => {
      return {
        key: `${columnDef.field}-${idx}`,
        field: columnDef.field,
        accessorKey: columnDef.field,
        header: columnDef.name,
        accessorFn: jsonPathAccessor(columnDef.field),
        Cell: columnDef?.contentType
          ? extractCellValue(
              DiscoveryTableCellRenderer(
                columnDef?.contentType,
                columnDef?.cellRenderFunction ?? 'default',
                {
                  ...(columnDef?.params ?? {}),
                  valueIfNotAvailable: columnDef?.valueIfNotAvailable ?? '',
                },
              ),
            )
          : extractCellValue(
              DiscoveryTableCellRenderer(
                'string',
                columnDef?.cellRenderFunction ?? 'default',
                {
                  ...(columnDef?.params ?? {}),
                  valueIfNotAvailable: columnDef?.valueIfNotAvailable ?? '',
                },
              ),
            ),
      };
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
      expanded: config.tableConfig?.expandableRows === true ? true : undefined,
      columnVisibility: {
        'mrt-row-expand': false,
      },
    },
    layoutMode: 'semantic',
    mantineDetailPanelProps: {
      style: {
        boxShadow: '0 -2px 0px 0px var(--table-border-color) inset',
      },
    },
    mantineTableHeadCellProps: {
      style: {
        backgroundColor: 'var(--mantine-color-table-1)',
        color: 'var(--mantine-color-table-contrast-1)',
        textAlign: 'center',
        padding: 'var(--mantine-spacing-md)',
        fontWeight: 600,
        fontSize: 'var(--mantine-font-size-sm)',
        textTransform: 'uppercase',
      },
    },
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        setStudyDetails(() => {
          console.log('row.original', row.original);
          return { ...row.original };
        });
      },
      style: {
        borderWidth: 0,
        fontSize: 'var(--mantine-font-size-sm)',
      },
    }),
    mantineTableProps: {
      style: {
        backgroundColor: 'var(--mantine-color-base-1)',
        '--mrt-striped-row-background-color': 'var(--mantine-color-base-3)',
      },
    },
  });

  useDeepCompareEffect(() => {
    //fetch data based on row selection state or something

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
        <Text size={'xl'}>Error loading discovery data</Text>
      </div>
    );
  }
  return (
    <React.Fragment>
      <StudyDetails
        index={config?.minimalFieldMapping?.uid ?? 'unknown'}
        detailView={config.detailView}
        simpleDetailsView={config.simpleDetailsView}
        authz={config.features.authorization}
      />
      <div className="grow w-auto inline-block overflow-x-scroll">
        <LoadingOverlay visible={dataRequestStatus.isLoading} />
        <MantineReactTable table={table} />
      </div>
    </React.Fragment>
  );
};

export default DiscoveryTable;
