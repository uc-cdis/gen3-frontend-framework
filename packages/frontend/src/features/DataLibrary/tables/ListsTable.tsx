import React from 'react';
import { useDeepCompareMemo } from 'use-deep-compare';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import FilesTable from './FilesTable';
import AdditionalDataTable from './AdditionalDataTable';
import QueriesTable from './QueriesTable';
import { DatasetContents } from '../types';
import { commonTableSettings } from './tableSettings';
import { Menu } from '@mantine/core';

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'numFiles',
    header: '# Files',
  },
  {
    accessorKey: 'isAddDataSource',
    header: 'Additional Data Sources',
  },
];

export interface ListsTableProps {
  data: Array<DatasetContents>;
}

const ListContentsTable = ({ data }: ListsTableProps) => {
  const rows = useDeepCompareMemo(
    () => [
      ...data.map(({ name, id }, j) => {
        return {
          name: name,
          id: id, // TODO: fix id
          numFiles: data?.[j]?.files.length || 0,
          isAddDataSource:
            data?.[j]?.additionalData.length !== 0 ? 'True' : 'False',
        };
      }),
    ],
    [data],
  );

  const table = useMantineReactTable({
    columns: columns,
    data: rows,
    ...commonTableSettings,
    renderRowActionMenuItems: () => (
      <>
        <Menu.Item>Remove</Menu.Item>
      </>
    ),
    renderDetailPanel: ({ row }) => {
      const rowIdx = row.index;

      return (
        <div className="flex flex-col w-full">
          {data?.[rowIdx]?.files.length > 0 && (
            <FilesTable header={'Files'} data={data?.[rowIdx]?.files} />
          )}
          {data?.[rowIdx]?.additionalData.length > 0 && (
            <AdditionalDataTable
              header={'Additional Data'}
              data={data?.[rowIdx]?.additionalData}
            />
          )}
          {data?.[rowIdx]?.queries.length > 0 && (
            <QueriesTable header="Queries" data={data?.[rowIdx]?.queries} />
          )}
        </div>
      );
    },
  });

  return (
    <div className="flex flex-col ml-8 w-full">
      <div>
        <MantineReactTable table={table} />
      </div>
    </div>
  );
};

export default ListContentsTable;
