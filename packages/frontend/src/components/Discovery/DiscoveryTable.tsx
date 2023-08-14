import React, { useContext, useMemo, useState } from 'react';
import {
  MantineReactTable,
  type MRT_PaginationState,
  type MRT_SortingState,
  useMantineReactTable,
} from 'mantine-react-table';
import { useGetAggMDSQuery, MetadataPaginationParams } from '@gen3/core';
import { jsonPathAccessor } from './utils';
import { DiscoveryTableCellRenderer } from './TableRenderers/CellRendererFactory';
import { DiscoveryTableRowRenderer } from './TableRenderers/RowRendererFactory';
import { DiscoveryConfigContext } from './DiscoveryConfigProvider';
import { DiscoveryTableDataHook } from './types';



export interface DiscoveryTableConfig {
  dataHook: DiscoveryTableDataHook
}

const DiscoveryTable = ({
  dataHook,
}: DiscoveryTableConfig) => {
  const config = useContext(DiscoveryConfigContext);

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  // const { data, isLoading, isFetching, isError } = useGetAggMDSQuery({
  //   url: dataURL,
  //   guidType: studyKey,
  //   pageSize: pagination.pageSize,
  //   offset: pagination.pageIndex * pagination.pageSize,
  // });
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
          ? DiscoveryTableCellRenderer(
              columnDef?.contentType,
              columnDef?.cellRenderFunction ?? 'default',
              columnDef?.params,
            )
          : DiscoveryTableCellRenderer('string', 'default', columnDef?.params,),
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
  });

  return (
    <div className="w-100 bg-red">
      <MantineReactTable table={table} />
    </div>
  );
};

export default DiscoveryTable;
