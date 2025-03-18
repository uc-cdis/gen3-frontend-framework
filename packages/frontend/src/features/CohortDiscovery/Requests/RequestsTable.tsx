import React, { useMemo } from 'react';
import { AppState } from '../appApi';

import {
  MantineReactTable,
  useMantineReactTable,
  MRT_ColumnDef,
} from 'mantine-react-table';
import { TableIcons } from '../../../components/Tables/TableIcons';

import { selectAllCohorts } from '../CohortManagerSlice';
import { useAppSelector } from '../appApi';
import { Cohort } from '../types';

const RequestsTable = () => {
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

  const data = useAppSelector((state: AppState) => selectAllCohorts(state));

  const table = useMantineReactTable({
    columns,
    data,
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
    <div className="inline-block overflow-x-scroll w-full">
      <MantineReactTable table={table} />
    </div>
  );
};
export default RequestsTable;
