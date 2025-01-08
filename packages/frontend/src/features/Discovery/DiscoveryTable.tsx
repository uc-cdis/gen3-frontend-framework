import React, { useState } from 'react';
import {
  MantineReactTable,
  MRT_Cell,
  type MRT_PaginationState,
  type MRT_SortingState,
  type MRT_RowSelectionState,
  useMantineReactTable,
} from 'mantine-react-table';

import classes from './style/DiscoveryTable.module.css';

import { getManualSortingAndPagination, jsonPathAccessor } from './utils';
import { DiscoveryTableCellRenderer } from './TableRenderers/CellRendererFactory';
import { DiscoveryTableRowRenderer } from './TableRenderers/RowRendererFactory';
import { useDiscoveryContext } from './DiscoveryProvider';
import StudyDetails from './StudyDetails/StudyDetails';
import { CellRendererFunction } from './TableRenderers/types';
import { JSONObject } from '@gen3/core';
import { TableIcons } from '../../components/Tables/TableIcons';
import {
  OnChangeFn,
  PaginationState,
  SortingState,
} from '@tanstack/table-core';
import { DataRequestStatus } from './types';
import { LoadingOverlay } from '@mantine/core';
import { useDeepCompareMemo } from 'use-deep-compare';

const extractCellValue =
  (func: CellRendererFunction) =>
  ({ cell }: { cell: MRT_Cell<JSONObject> }) =>
    func({ value: cell.getValue() as never, cell });

interface DiscoveryTableProps {
  data: Array<Record<string, any>>;
  hits: number;
  dataRequestStatus: DataRequestStatus;
  pagination: MRT_PaginationState;
  sorting: MRT_SortingState;
  setPagination: OnChangeFn<PaginationState>;
  setSorting: OnChangeFn<SortingState>;
}

const DiscoveryTable = ({
  data,
  hits,
  dataRequestStatus,
  setSorting,
  setPagination,
  pagination,
  sorting,
}: DiscoveryTableProps) => {
  const { discoveryConfig: config, setStudyDetails } = useDiscoveryContext();
  const { isLoading, isError, isFetching } = dataRequestStatus;
  const manualSortingAndPagination = getManualSortingAndPagination(config);
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

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
  }, [config.studyColumns]);

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
    enableRowSelection: config.tableConfig?.selectableRows ?? false,
    onRowSelectionChange: setRowSelection,
    rowCount: hits,
    icons: TableIcons,
    enableTopToolbar: false,
    enableColumnFilters: false,
    enableColumnActions: false,
    enableStickyHeader: true,
    enableStickyFooter: true,

    // TODO: keep this to explore later
    // mantineTableContainerProps: ({ table }) => {
    //   return {
    //     sx: {
    //       maxHeight: 'calc(100vh - 560px) !important;',
    //     },
    //   };
    // },
    renderDetailPanel: config.studyPreviewField
      ? DiscoveryTableRowRenderer(config.studyPreviewField)
      : undefined,
    state: {
      isLoading,
      rowSelection,
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
          return { ...row.original };
        });
      },
      className: classes.tableRow,
    }),
    mantineTableProps: {
      style: {
        backgroundColor: 'var(--mantine-color-base-1)',
        '--mrt-striped-row-background-color': 'var(--mantine-color-base-3)',
      },
    },
  });

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
