import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Menu, SegmentedControl } from '@mantine/core';
import {
  MantineReactTable,
  type MRT_Cell,
  type MRT_ColumnDef,
  useMantineReactTable,
} from 'mantine-react-table-open';
import { PiDotsThreeOutlineFill as DotIcon } from 'react-icons/pi';
import type { JobWithActions, SowerJobStatus } from '@gen3/core';
import {
  removeSowerJob,
  useCoreDispatch,
  useLazyGetSowerOutputQuery,
} from '@gen3/core';
import { backgroundStyles } from './colors';

export interface JobTableProps {
  readonly data?: Array<JobWithActions>;
}

interface ColorConfig {
  mantine: string;
  text: string;
  bg: string;
  border: string;
}

const STATUS_TO_COLOR: Record<string, ColorConfig> = {
  Running: {
    mantine: 'utility.1',
    text: 'var(--mantine-color-utility-contrast-1)',
    bg: 'bg-utility-success',
    border: 'border-utility-success',
  },
  Failed: {
    mantine: 'utility.3',
    text: 'var(--mantine-color-utility-contrast-3)',
    bg: 'bg-utility-error',
    border: 'border-utility-error',
  },
  Completed: {
    mantine: 'utility.1',
    text: 'var(--mantine-color-utility-contrast-1)',
    bg: 'bg-utility-success',
    border: 'border-utility-success',
  },
};

const dateFormat = new Intl.DateTimeFormat('en-us', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
});

const JobTable = ({ data }: JobTableProps) => {
  const [filterValue, setFilterValue] = useState<SowerJobStatus>('All');
  const [getOutput, outputResponse] = useLazyGetSowerOutputQuery();
  const filteredData = useMemo(
    () =>
      filterValue === 'All'
        ? data || []
        : (data || []).filter((row) => row.status === filterValue),
    [filterValue, data],
  );
  const dispatch = useCoreDispatch();
  const groupedData = data ? Object.groupBy(data, (row) => row.status) : {};

  useEffect(() => {
    if (outputResponse.isSuccess && !outputResponse.isFetching) {
      window.open(outputResponse.data.output, '_blank');
    }
  }, [outputResponse]);

  const removeJob = useCallback(
    (id: string) => {
      dispatch(removeSowerJob(id));
    },
    [dispatch],
  );

  const columns = useMemo(
    () => [
      { accessorKey: 'uid', header: 'Job ID' },
      { accessorKey: 'name', header: 'Name' },
      {
        accessorKey: 'status',
        header: 'Status',
        Cell: ({ row }: MRT_Cell<JobWithActions>) => {
          const color = STATUS_TO_COLOR[row.original.status];
          return (
            <Badge
              variant="dot"
              color={color?.mantine}
              styles={{
                root: backgroundStyles[color.bg],
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
        Cell: ({ row }: MRT_Cell<JobWithActions>) =>
          dateFormat.format(row.original.updated),
      },
      {
        id: 'options',
        header: 'Actions',
        Cell: ({ row }: MRT_Cell<JobWithActions>) => (
          <>
            {row.original.status === 'Running' ? null : (
              <Menu>
                <Menu.Target>
                  <button>
                    <DotIcon />
                  </button>
                </Menu.Target>
                <Menu.Dropdown>
                  {row.original.status === 'Completed' ? (
                    <Menu.Item onClick={() => getOutput(row.original.uid)}>
                      {'Download'}
                    </Menu.Item>
                  ) : null}
                  <Menu.Item onClick={() => removeJob(row.original.uid)}>
                    {'Remove'}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </>
        ),
      },
    ],
    [getOutput, removeJob],
  );

  const table = useMantineReactTable({
    columns: columns as MRT_ColumnDef<JobWithActions>[],
    data: filteredData,
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
                  styles={{
                    label: {
                      color: STATUS_TO_COLOR['Running'].text,
                    },
                  }}
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
                  styles={{
                    label: {
                      color: STATUS_TO_COLOR['Completed'].text,
                    },
                  }}
                >
                  {groupedData?.Completed?.length || 0}
                </Badge>
              </div>
            ),
          },
          {
            value: 'Failed',
            label: (
              <div className="flex gap-2">
                <span>Failed</span>
                <Badge
                  circle
                  color={STATUS_TO_COLOR['Failed'].mantine}
                  variant="light"
                  styles={{
                    label: {
                      color: STATUS_TO_COLOR['Failed'].text,
                    },
                  }}
                >
                  {groupedData?.Failed?.length || 0}
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
