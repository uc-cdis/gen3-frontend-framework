import React, { useContext, useMemo } from 'react';
import {
  MantineReactTable,
  type MRT_ColumnDef,
  useMantineReactTable,
} from 'mantine-react-table';
import { Badge, Menu, MultiSelect, Table } from '@mantine/core';

import { Policy, Resource } from '../types';
import { AuthzContext } from '../Provider';



export const buildResourcePaths = (resource: Resource, prefix= '', result: string[] = []): string[] => {
  // Add the current resource name to the result array
  const currentName = prefix + '/' + resource.name;
  result.push(currentName);

  // If the resource has subresources, recursively call this function on each
  if (resource.subresources) {
    for (const subresource of resource.subresources) {
      buildResourcePaths(subresource, currentName, result);
    }
  }

  return result;
};


const PoliciesTable = () => {
  const context = useContext(AuthzContext);
  const all_roles = context.state.roles.map((role) => role.id);
  // resource_paths is a list of strings, each of which is a path to a resource
  // use a reducer to flatten the list of lists of strings into a single list of strings
  const all_resources = context.state.resources.reduce((acc: string[], resource: Resource) => {
    return acc.concat(buildResourcePaths(resource));
  }, []);

  const columns = useMemo<MRT_ColumnDef<Policy>[]>(
    () => [
      {
        id: 'id',
        header: 'Id',
        accessorFn: (policy: Policy) => policy.id,
      },
      {
        id: 'Description',
        header: 'Description',
        accessorFn: (policy: Policy) => policy.description ?? '',
      },
      {
        id: 'role_ids',
        header: 'Roles',
        accessorFn: (policy: Policy) => policy.role_ids,
        Cell: ({ row} ) => {
          return (<MultiSelect data={all_roles} value={row.original.role_ids} onChange={(value) => console.log(value)} />);
        }
      },
      {
        id: 'resource_paths',
        header: 'Resources',
        accessorFn: (policy: Policy) => policy.resource_paths,
        Cell: ({ row}) => {
          return (<MultiSelect data={all_resources} value={row.original.resource_paths} onChange={(value) => console.log(value)} />);
        }
      },
    ],
    [],
  );

  const table = useMantineReactTable<Policy>({
    columns,
    data: context.state.policies ?? [],
    enableRowActions: true,
    positionActionsColumn: 'last',
    renderRowActionMenuItems: ({ row }) => (
      <>
        <Menu.Item onClick={() => console.info('Delete')}>Delete</Menu.Item>
      </>
    ),
    enableRowSelection: true,
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    mantinePaginationProps: {
      radius: 'md',
      size: 'lg',
    },

  });

  return (
    <div className="m-2">
      <MantineReactTable  table={table} />
    </div>
  );
};

export default PoliciesTable;
