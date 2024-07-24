import React, { useMemo } from 'react';
import {
  MantineReactTable,
  MRT_Cell,
  type MRT_PaginationState,
  type MRT_SortingState,
  useMantineReactTable,
} from 'mantine-react-table';

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
  ({ cell }: { cell: MRT_Cell }) =>
    func({ value: cell.getValue() as never, cell });

interface DiscoveryTableProps {
  data: JSONObject[];
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
    columns: cols as any[], // TODO: fix typing issues when migrating to mantine-react-table v2.
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
    mantineTableHeadCellProps: {
      sx: (theme) => {
        return {
          backgroundColor: theme.colors.table[1],
          color: theme.colors.table[5],
          textAlign: 'center',
          padding: theme.spacing.md,
          fontWeight: 'bold',
          fontSize: theme.fontSizes.lg,
          textTransform: 'uppercase',
        };
      },
    },
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: (event) => {
        setStudyDetails(() => {
          return { ...row.original };
        });
      },
      sx: {
        cursor: 'pointer', //you might want to change the cursor too when adding an onClick
      },
    }),
    mantineTableProps: {
      sx: (theme) => {
        return {
          backgroundColor: theme.colors.base[1],
        };
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
