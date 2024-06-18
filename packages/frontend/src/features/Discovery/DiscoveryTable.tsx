import React, { useMemo } from 'react';
import {
  MantineReactTable,
  MRT_Cell,
  type MRT_SortingState,
  type MRT_PaginationState,
  useMantineReactTable,
} from 'mantine-react-table';

import { jsonPathAccessor } from './utils';
import { DiscoveryTableCellRenderer } from './TableRenderers/CellRendererFactory';
import { DiscoveryTableRowRenderer } from './TableRenderers/RowRendererFactory';
import { useDiscoveryContext } from './DiscoveryProvider';
import StudyDetails from './StudyDetails/StudyDetails';
import { CellRendererFunction } from './TableRenderers/types';
import { JSONObject } from '@gen3/core';
import {
  OnChangeFn,
  PaginationState,
  SortingState,
} from '@tanstack/table-core';
import { DataRequestStatus } from './types';
import { LoadingOverlay } from '@mantine/core';

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
  const { discoveryConfig: config } = useDiscoveryContext();
  const { isLoading, isError, isFetching } = dataRequestStatus;

  const cols = useMemo(() => {
    const studyColumns = config.studyColumns ?? [];
    return studyColumns.map((columnDef) => {
      return {
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
  }, []);

  const table = useMantineReactTable({
    columns: cols as any[],
    data: data ?? [],
    manualSorting: true,
    manualPagination: true,
    paginateExpandedRows: false,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableRowSelection: config.tableConfig?.selectableRows ?? false,
    rowCount: hits,
    enableTopToolbar: false,
    renderDetailPanel: config.studyPreviewField
      ? DiscoveryTableRowRenderer(config.studyPreviewField)
      : undefined,
    state: {
      isLoading,
      pagination,
      sorting,
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
