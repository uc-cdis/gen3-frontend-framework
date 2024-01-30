import React, { useContext, useMemo } from 'react';
import {
  MantineReactTable,
  type MRT_ColumnDef,
  useMantineReactTable,
} from 'mantine-react-table';

import { Resource } from '../types';
import { AuthzContext } from '../Provider';

type ResourceTableData = {
  name: string;
  description: string;
  subRows: ResourceTableData[];
};

const expandAll = (data: Resource): ResourceTableData => {
  return {
    name: data.name,
    description: data.description ?? '',
    subRows: data?.subresources?.map((child) => expandAll(child)) ?? [],
  };
};

const ResourcesTable = () => {
  const context = useContext(AuthzContext);

  const columns = useMemo<MRT_ColumnDef<ResourceTableData>[]>(
    () => [
      {
        name: 'name',
        header: 'name',
        accessorFn: (resource: Resource) => resource.name,
      },
      {
        id: 'Description',
        header: 'Description',
        accessorFn: (resource: Resource) => resource.description ?? '',
      },
    ],
    [],
  );

  const data = useMemo<ResourceTableData[]>(
    () => context.state.resources.map((resource) => expandAll(resource)),
    [context.state.resources],
  );

  const table = useMantineReactTable<ResourceTableData>({
    columns,
    data,
    enableRowActions: true,
    positionActionsColumn: 'last',
    enableExpanding: true,
    enableExpandAll: true,
    paginateExpandedRows: false,
  });

  return (
    <MantineReactTable
      table={table}
    />
  );
};

export default ResourcesTable;
