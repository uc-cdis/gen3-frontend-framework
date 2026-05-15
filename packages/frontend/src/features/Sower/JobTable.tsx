import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Code, Menu, SegmentedControl, Tooltip } from '@mantine/core';
import {
  MantineReactTable,
  type MRT_Cell,
  type MRT_ColumnDef,
  useMantineReactTable,
} from 'mantine-react-table-open';
import { PiDotsThreeOutlineFill as DotIcon } from 'react-icons/pi';
import {
  type JobListResponse,
  type JobStatus,
  type SowerJobCacheEntry,
  useLazyGetSowerOutputQuery,
} from '@gen3/core';

export interface JobTableProps {
  readonly data: JobListResponse | undefined;
  readonly isLoading: boolean;
  readonly sowerJobDatetimeCache: Record<string, SowerJobCacheEntry>;
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

function ShortUUID({ uuid }: { uuid: string }) {
  // Take first 8 chars and add ellipsis
  const shortUuid = `${uuid.slice(0, 8)}...`;

  return (
    <Tooltip label={uuid} withArrow>
      <Code style={{ cursor: 'pointer' }}>{shortUuid}</Code>
    </Tooltip>
  );
}

const JobTable = ({
  data,
  isLoading,
  sowerJobDatetimeCache,
}: JobTableProps) => {
  const [filterValue, setFilterValue] = useState('Running');
  const [getOutput, outputResponse] = useLazyGetSowerOutputQuery();
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

  useEffect(() => {
    if (outputResponse.isSuccess && !outputResponse.isFetching) {
      window.open(outputResponse.data.output, '_blank');
    }
  }, [outputResponse]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'uid',
        header: 'Job ID',
        Cell: ({ row }: MRT_Cell<JobStatus>) => {
          return <ShortUUID uuid={row.original.uid} />;
        },
      },
      { accessorKey: 'name', header: 'Name' },
      {
        accessorKey: 'status',
        header: 'Status',
        Cell: ({ row }: MRT_Cell<JobStatus>) => {
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
        Cell: ({ row }: MRT_Cell<JobStatus>) =>
          sowerJobDatetimeCache?.[row.original.uid]
            ? dateFormat.format(
                sowerJobDatetimeCache[row.original.uid].createdAt,
              )
            : '--',
      },
      {
        id: 'options',
        header: '',
        Cell: ({ row }: MRT_Cell<JobStatus>) => (
          <>
            {row.original.status === 'Completed' ? (
              <Menu>
                <Menu.Target>
                  <button>
                    <DotIcon />
                  </button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item onClick={() => getOutput(row.original.uid)}>
                    {'Download'}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : null}
          </>
        ),
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns: columns as MRT_ColumnDef<JobStatus>[],
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
