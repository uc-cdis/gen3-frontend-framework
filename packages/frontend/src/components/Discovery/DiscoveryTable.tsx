import React, { useEffect, useMemo, useState } from 'react';
import {
  MantineReactTable,
  MRT_Cell,
  type MRT_PaginationState,
  type MRT_SortingState,
  useMantineReactTable,
} from 'mantine-react-table';
import { useDisclosure } from '@mantine/hooks';

import { jsonPathAccessor } from './utils';
import { DiscoveryTableCellRenderer } from './TableRenderers/CellRendererFactory';
import { DiscoveryTableRowRenderer } from './TableRenderers/RowRendererFactory';
import { useDiscoveryConfigContext } from './DiscoveryConfigProvider';
import { DiscoveryTableDataHook } from './types';
import StudyDetails from './StudyDetails/StudyDetails';
import { CellRendererFunction } from './TableRenderers/types';


export interface DiscoveryTableConfig {
  dataHook: DiscoveryTableDataHook;
}

const extractCellValue =
  (func: CellRendererFunction) =>
  ({ cell }: { cell: MRT_Cell }) =>
    func({ value: cell.getValue() as never, cell });

const DiscoveryTable = ({ dataHook }: DiscoveryTableConfig) => {
  const { discoveryConfig: config, studyDetails } = useDiscoveryConfigContext();
  const [opened, { open, close }] = useDisclosure(false);

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });



  const { data, isLoading, isFetching, isError } = dataHook({
    pageSize: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  });

  const [sorting, setSorting] = useState<MRT_SortingState>([]);

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
                columnDef?.params,
              ),
            )
          : extractCellValue(
              DiscoveryTableCellRenderer(
                'string',
                'default',
                columnDef?.params,
              ),
            ),
      };
    });
  }, [config]);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const table = useMantineReactTable({
    columns: cols,
    data: data?.data ?? [],
    manualSorting: true,
    manualPagination: true,
    paginateExpandedRows: false,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onHoveredRowChange: (row) => {
      console.log('hovered: ', row);
    },
    onHoveredColumnChange: (column) => {
      console.log('hovered: ', column);
    },
    rowCount: data?.hits ?? 0,
    renderDetailPanel: config.studyPreviewField
      ? DiscoveryTableRowRenderer(config.studyPreviewField)
      : undefined,
    state: {
      isLoading,
      pagination,
      sorting,
      showProgressBars: isFetching,
      showAlertBanner: isError,
      expanded: true,
      columnVisibility: {
        'mrt-row-expand': false,
      },
    },
    layoutMode: 'semantic',
    mantineTableHeadCellProps: {
      sx: (theme) =>  { return {
        backgroundColor: theme.colors.secondary[9],
        textAlign: 'center',
        padding: theme.spacing.md,
        fontWeight: 'bold',
        fontSize: theme.fontSizes.xl,
        textTransform: 'uppercase',
      };}
    },
  });

  return (
    <React.Fragment>
      <StudyDetails />
      <MantineReactTable table={table} />
    </React.Fragment>
  );
};

export default DiscoveryTable;
