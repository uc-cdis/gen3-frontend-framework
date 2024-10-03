import React from 'react';
import { useDeepCompareMemo } from 'use-deep-compare';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { ActionIcon } from '@mantine/core';
import { MdOutlineRemoveCircle as RemoveIcon } from 'react-icons/md';
import AdditionalDataTable from './AdditionalDataTable';
import QueriesTable from './QueriesTable';
import { DatasetContents } from '../types';
import { commonTableSettings } from './tableSettings';

import FilesTable from './FilesTable';

/**
 *  Component that manages a List items, which are composed of Dataset and/or Cohorts
 */
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
  listId: string;
  data: Array<DatasetContents>;
  removeList: (listId: string, itemId: string) => void;
}

const ListContentsTable = ({ listId, data, removeList }: ListsTableProps) => {
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
    renderRowActions: ({ row }) => (
      <ActionIcon
        aria-label={`remove datalist ${row.original.name} from list`}
        onClick={() => {
          removeList(listId, row.original.name);
        }}
      >
        <RemoveIcon />
      </ActionIcon>
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
