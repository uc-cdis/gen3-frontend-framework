import React, { useMemo, useState } from 'react';
import {
  MantineReactTable,
  type MRT_PaginationState,
  useMantineReactTable,
} from 'mantine-react-table';
import { Loader, Text } from '@mantine/core';
import { useGetProjectsDetailsQuery } from '@gen3/core';
import { ProjectTableConfig } from '../types';
import { buildQuery } from '../utils';

const projectQuery = { query: 'query { project(first:0) {code, project_id, availability_type}}'};


const ProjectTable = ({ columns } : ProjectTableConfig) => {

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const mapping = useMemo(() => {
    const mapping: Record<string, string> = {};
    columns.forEach((column) => {
      mapping[column.field] = column.field;
    });
    return mapping;
  }, [columns]);

  const detailQuery = { query: `query projectDetailQuery(
  $name: [String]
) {
  project(project_id: $name) {
    name: project_id
    code
    id
  }
  ${buildQuery(Object.keys(mapping)).join('\n')}
}`};

  const { data, isLoading, isFetching, isError } = useGetProjectsDetailsQuery({
    size: 10,
    projectQuery: projectQuery,
    projectDetailsQuery: detailQuery,
    mapping: mapping,
  });
  const cols = useMemo(() => {
    return [
      {
        field: 'name',
        accessorKey: 'project.name',
        header: 'Project',
      },
      ...columns.map((columnDef) => {
      return {
        field: columnDef.field,
        accessorKey: columnDef.field,
        header: columnDef.name,
      };
    })
  ];
  }, [columns]);




  const table = useMantineReactTable({
    columns: cols,
    data: data?.details ?? [],
    manualSorting: true,
    manualPagination: true,
    paginateExpandedRows: false,
    onPaginationChange: setPagination,
    rowCount: data?.hits ?? 0,
    enableTopToolbar: false,
    layoutMode: 'semantic',
    state: {
      isLoading,
      pagination,
      showProgressBars: isFetching,
      showAlertBanner: isError,
      columnVisibility: {
        'mrt-row-expand': false,
      },
    },
    mantineTableHeadCellProps: {
      sx: (theme) => {
        return {
          backgroundColor: theme.colors.table[8],
          color: theme.colors.table[0],
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
          backgroundColor: theme.colors.base[9],
        };
      },
    }
  });

  if (isLoading) {
    return (
      <div className="flex w-full py-24 relative justify-center"><Loader  variant="dots"  /> </div>);
  }

  if (isError) {
    return (
      <div className="flex w-full py-24 h-100 relative justify-center">
        <Text size={'xl'}>Error loading project data</Text>
      </div>);
  }

  return (
    <div className="flex w-full bg-base-max p-4 rounded-lg">
      <div className="grow w-auto inline-block overflow-x-scroll">
        <MantineReactTable table={table} />
      </div>
    </div>
  );
};

export default ProjectTable;
