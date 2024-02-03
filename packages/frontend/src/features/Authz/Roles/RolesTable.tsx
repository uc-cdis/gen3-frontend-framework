import React, { useContext, useMemo } from 'react';
import {
  MantineReactTable,
  type MRT_ColumnDef,
  useMantineReactTable,
} from 'mantine-react-table';

import { Role } from '../types';
import { AuthzContext } from '../Provider';
import { Table, Menu, Stack } from '@mantine/core';
import PermissionDetailRow from './PermissionnDetailsRow';

const RolesTable = () => {
  const context = useContext(AuthzContext);

  const columns = useMemo<MRT_ColumnDef<Role>[]>(
    () => [
      {
        id: 'id',
        header: 'Id',
        accessorFn: (role: Role) => role.id,
      },
      {
        id: 'Description',
        header: 'Description',
        accessorFn: (role: Role) => role.description ?? '',
      },
      {
        id: 'Permissions',
        header: 'Permissions',
        accessorFn: (role: Role) => role.permissions.length,
      },
    ],
    [],
  );

  const table = useMantineReactTable<Role>({
    columns,
    data: context.state.roles ?? [],
    enableRowActions: true,
    positionActionsColumn: 'last',
    renderRowActionMenuItems: ({ row }) => (
      <React.Fragment>
        <Menu.Item onClick={() => console.info('Delete')}>Delete</Menu.Item>
      </React.Fragment>
    ),
    enableRowSelection: true,

    renderDetailPanel: ({ row }) => {
      const subrows = row.original.permissions.map((element) => (
        <PermissionDetailRow key={element.id} permission={element} />
      ));

      return (
        <Stack>
          <Table>
            <thead>
              <tr>
                <th>id</th>
                <th>service</th>
                <th>method</th>
              </tr>
            </thead>
            <tbody>{subrows}</tbody>
          </Table>
        </Stack>
      );
    },

    initialState: { showColumnFilters: false, showGlobalFilter: true },
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    mantinePaginationProps: {
      radius: 'md',
      size: 'lg',
    },
    mantineSearchTextInputProps: {
      placeholder: 'Search Roles',
    },
  });

  return <MantineReactTable table={table} />;

  // return <div>Roles</div>;
};

export default RolesTable;
