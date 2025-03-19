import React, { useState, useMemo } from 'react';
import { AppState, useAppDispatch } from '../appApi';
import {
  MantineReactTable,
  useMantineReactTable,
  MRT_ColumnDef,
} from 'mantine-react-table';
import { TableIcons } from '../../../components/Tables/TableIcons';
import {
  ActionIcon,
  Group,
  Modal,
  Text,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { Icon } from '@iconify/react';
import { IconSize } from '../../../utils/sizes';
import { selectAllCohorts, removeCohort } from '../CohortManagerSlice';
import { useAppSelector } from '../appApi';
import { Cohort } from '../types';

interface SavedCohortsTableProps {
  openModal: (id: string) => void;
  size?: string;
}
const SavedCohortsTable: React.FC<SavedCohortsTableProps> = ({
  openModal,
  size = 'md',
}) => {
  const appDispatch = useAppDispatch();

  const columns = useMemo<MRT_ColumnDef<Cohort>[]>(
    () => [
      {
        accessorKey: 'name', //access nested data with dot notation
        header: 'Name',
      },
      {
        accessorKey: 'created_datetime',
        header: 'Modified Date',
      },
      {
        accessorKey: 'modified_datetime', //normal accessorKey
        header: 'Created Date',
      },
    ],
    [],
  );

  const iconSize = IconSize[size] || IconSize['sm'];
  const theme = useMantineTheme();
  const data = useAppSelector((state: AppState) => selectAllCohorts(state));

  const table = useMantineReactTable({
    columns,
    data,
    getRowId: (originalRow) => originalRow.id,
    enableRowActions: true,
    enableTopToolbar: false,
    enableStickyHeader: true,
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (
      <Group>
        <Tooltip label="Submit Data Access Request" withArrow>
          <ActionIcon
            color="accent.4"
            variant="transparent"
            aria-label="Submit Data Access Request"
            onClick={() => {
              openModal(row.id);
            }}
          >
            <Icon
              icon="gen3:request"
              height={iconSize}
              width={iconSize}
              color={theme.colors.secondary[4]}
            />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete Cohort" withArrow>
          <ActionIcon
            color="accent.4"
            variant="transparent"
            aria-label="Delete saved cohort"
            onClick={() => {
              modals.openConfirmModal({
                title: 'Delete Cohort',
                centered: true,
                children: (
                  <Text size="sm">
                    Are you sure you want to delete your cohort? Deleted cohorts
                    cannot be restored.
                  </Text>
                ),
                labels: { confirm: 'Delete Cohort', cancel: 'Cancel' },
                confirmProps: { color: theme.colors.utility[2] },
                onConfirm: () => {
                  appDispatch(removeCohort(row.id));
                },
              });
            }}
          >
            <Icon
              icon="gen3:delete"
              height={iconSize}
              width={iconSize}
              color={theme.colors.secondary[4]}
            />
          </ActionIcon>
        </Tooltip>
      </Group>
    ),
    icons: TableIcons,
    mantinePaginationProps: {
      rowsPerPageOptions: ['5', '10', '20', '40', '100'],
      withEdges: false, //note: changed from `showFirstLastButtons` in v1.0
    },
    mantineTableHeadCellProps: {
      style: {
        '--mrt-base-background-color': 'var(--mantine-color-table-1)',
        color: `var(--mantine-color-table-contrast-5')`,
      },
    },
  });

  return (
    <>
      <div className="inline-block overflow-x-scroll w-full">
        <MantineReactTable table={table} />
      </div>
    </>
  );
};
export default SavedCohortsTable;
