import React, { useState, useMemo } from 'react';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_SortingState,
  type MRT_PaginationState,
  MRT_Row,
} from 'mantine-react-table';
import { JSONObject, useGetMetadataQuery } from '@gen3/core';
import { StudyColumn } from './types';
import { jsonPathAccessor } from './utils';
import { Box, Text } from '@mantine/core';
import { DiscoveryTableCellRenderer } from './TableRenderers/CellRendererFactory';

export interface DiscoveryTableConfig {
  readonly columns: StudyColumn[];
  readonly dataURL?: string; // Override the default MDS URL
  readonly studyKey?: string; // Override the default MDS key
}

const DiscoveryTable = ({
  columns,
  dataURL,
  studyKey = 'gen3_discovery',
}: DiscoveryTableConfig) => {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data, isLoading, isFetching, isError } = useGetMetadataQuery({
    url: dataURL,
    studyKey: studyKey,
    pageSize: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const cols = useMemo(() => {
    const cols = columns.map((columnDef) => {
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
          : undefined,
      };
    });
    return cols;
  }, [columns]);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const table = useMantineReactTable({
    columns: cols,
    data: data?.data ?? [],
    manualSorting: true,
    manualPagination: true,
    enableStickyHeader: true,
    paginateExpandedRows: false,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount: data?.hits ?? 0,
    renderDetailPanel: ({ row }: { row: MRT_Row<JSONObject> }) => (
      <Box
        sx={{
          display: 'flex column',
          margin: 'auto',
          width: '100%',
        }}
      >
        <Text lineClamp={2} fz="xs">
          {(row.original?.study_description as string) ??
            'No description available'}
        </Text>
      </Box>
    ),
    state: {
      isLoading,
      pagination,
      sorting,
      showProgressBars: isFetching,
      showAlertBanner: isError,
      density: 'xs',
    },
  });

  return (
    <div className="w-auto inline-block overflow-x-scroll">
      <MantineReactTable table={table} />
    </div>
  );
};

export default DiscoveryTable;
