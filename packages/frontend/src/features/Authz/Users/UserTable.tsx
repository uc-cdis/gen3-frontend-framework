import React, { useContext, useMemo, useState } from 'react';
import {
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_RowSelectionState,
  useMantineReactTable,
} from 'mantine-react-table';
import { User } from '../types';
import { AuthzContext } from '../Provider';
import { Menu } from '@mantine/core';

interface UserTableProps {
  setCurrentUser: (user: User) => void;
  setPanelToUserDetail: () => void;
}

const UserTable = ({
  setCurrentUser,
  setPanelToUserDetail,
}: UserTableProps) => {
  const context = useContext(AuthzContext);
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  const users = useMemo(
    () =>
      Object.entries(context.state.users).map(([key, user]) => {
        return { id: key, tags: user.tags };
      }),
    [context.state.users],
  );

  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        id: 'id',
        header: 'User Id',
        accessorFn: (user: User) => user.id,
      },
      {
        id: 'name',
        header: 'Name',
        accessorFn: (user: User) => user.tags?.name,
      },
      {
        id: 'email',
        header: 'Email',
        accessorFn: (user: User) => user.tags?.email,
      },
    ],
    [],
  );

  const table = useMantineReactTable<User>({
    columns,
    data: users, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableRowActions: true,
    positionActionsColumn: 'last',
    renderRowActionMenuItems: ({ row }) => (
      <React.Fragment>
        <Menu.Item
          onClick={() => {
            setCurrentUser(row.original);
            setPanelToUserDetail();
          }}
        >
          Details
        </Menu.Item>
        <Menu.Item onClick={() => console.info('Delete')}>Delete</Menu.Item>
      </React.Fragment>
    ),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    initialState: { showColumnFilters: true, showGlobalFilter: true },
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    mantinePaginationProps: {
      radius: 'md',
      size: 'lg',
    },
    mantineSearchTextInputProps: {
      placeholder: 'Search Users',
    },
  });

  return <MantineReactTable table={table} />;
};

export default UserTable;
