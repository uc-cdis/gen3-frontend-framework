import React, { useMemo, useState } from 'react';

import { Badge, SegmentedControl } from '@mantine/core';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table';
import { PiDotsThreeOutlineFill as DotIcon } from 'react-icons/pi';
import { JobListResponse, JobStatus } from '@gen3/core';

export interface JobTableProps {
  readonly data: JobListResponse | undefined;
  readonly isLoading: boolean;
  readonly sowerJobDatetimeCache: Record<string, number>;
}

interface ColorConfig {
  readonly mantine: string;
  readonly tailwind: string;
}

const STATUS_TO_COLOR: Record<string, ColorConfig> = {
  Running: { mantine: 'utility.1', tailwind: 'utility-success' },
  Failed: { mantine: 'utility.3', tailwind: 'utility-error' },
  Completed: { mantine: 'utility.1', tailwind: 'utility-success' },
};

const JobTable = ({
  data,
  isLoading,
  sowerJobDatetimeCache,
}: JobTableProps) => {
  const [filterValue, setFilterValue] = useState('Running');
  const filteredData = useMemo(
    () =>
      filterValue === 'All'
        ? data || []
        : (data || []).filter((row) => row.status === filterValue),
    [filterValue, data],
  );
  const groupedData = data ? Object.groupBy(data, (row) => row.status) : {};

  const dateFormat = new Intl.DateTimeFormat('en-us', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  const columns: MRT_ColumnDef<JobStatus>[] = useMemo(
    () => [
      { accessorKey: 'uid', header: 'Job ID' },
      { accessorKey: 'name', header: 'Name' },
      {
        accessorKey: 'status',
        header: 'Status',
        Cell: ({ row }) => {
          const color = STATUS_TO_COLOR[row.original.status];
          return (
            <Badge
              variant="dot"
              color={color?.mantine}
              classNames={{
                root: `bg-${color?.tailwind} bg-opacity-25 text-${color?.tailwind} border-1 border-${color?.tailwind}`,
              }}
              radius="sm"
            >
              {row.original.status}
            </Badge>
          );
        },
      },
      {
        id: 'datetime',
        header: 'Datetime',
        Cell: ({ row }) =>
          sowerJobDatetimeCache?.[row.original.uid]
            ? dateFormat.format(sowerJobDatetimeCache[row.original.uid])
            : '--',
      },
      {
        id: 'options',
        header: '',
        Cell: () => <DotIcon />,
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data: filteredData,
    state: { isLoading },
    enableTopToolbar: false,
    enableColumnActions: false,
    enableSorting: false,
  });

  return (
    <>
      <SegmentedControl
        value={filterValue}
        onChange={setFilterValue}
        data={[
          {
            value: 'Running',
            label: (
              <div className="flex gap-2">
                <span>Running</span>
                <Badge
                  circle
                  color={STATUS_TO_COLOR['Running'].mantine}
                  variant="light"
                >
                  {groupedData?.Running?.length || 0}
                </Badge>
              </div>
            ),
          },
          {
            value: 'Completed',
            label: (
              <div className="flex gap-2">
                <span>Completed</span>
                <Badge
                  circle
                  color={STATUS_TO_COLOR['Completed'].mantine}
                  variant="light"
                >
                  {groupedData?.Completed?.length || 0}
                </Badge>
              </div>
            ),
          },
          { value: 'All', label: 'All Jobs' },
        ]}
        className="mb-8"
      />
      <MantineReactTable table={table} />
    </>
  );
};

export default JobTable;
