import React, { useState } from 'react';
import { JSONObject, useGetMetadataQuery } from '@gen3/core';
import {
  MantineReactTable,
  type MRT_PaginationState,
  type MRT_Row,
} from 'mantine-react-table';
import { Box, Text } from '@mantine/core';

interface ColumnDefiniton {
  header: string;
  accessor: string;
  className?: string;
}

export interface DiscoveryProps {
  readonly columns: Array<ColumnDefiniton>;
  readonly dataURL?: string; // Override the default MDS URL
  readonly studyKey?: string; // Override the default MDS key
}
const Discovery = ({ columns, dataURL, studyKey }: DiscoveryProps) => {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data, isLoading, isFetching, isError } = useGetMetadataQuery({
    url: dataURL,
    studyKey: studyKey ?? 'gen3_discovery',
    pageSize: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  });

  const RowDetail = (row: any) => {
    return (
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
    );
  };

  return (
    <div className="flex flex-col items-center p-2 m-2">
      <div className="flex flex-col w-full">
        {
          <MantineReactTable
            columns={columns}
            data={data?.data ?? []}
            manualPagination
            manualExpanding
            paginateExpandedRows={false}
            onPaginationChange={setPagination}
            rowCount={data?.hits ?? 0}
            renderDetailPanel={({ row }: { row: MRT_Row<JSONObject> }) => (
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
            )}
            state={{
              isLoading,
              pagination,
              showProgressBars: isFetching,
              showAlertBanner: isError,
              expanded: true,
              columnVisibility: {
                'mrt-row-expand': false,
              },
            }}
          />
        }
      </div>
    </div>
  );
};

export default Discovery;
