import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { ColumnResizeMode } from '@tanstack/react-table';
import { CohortItem } from '@gen3/core';

interface QueriesTableProps {
  data: Array<CohortItem>;
  header: string;
}

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
];

const QueriesTable = ({ data, header }: QueriesTableProps) => {
  const tableOptions = {
    columns,
    data: data,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableColumnResizing: true,
    columnResizeMode: 'onEnd' as ColumnResizeMode,
  };

  const table = useMantineReactTable<CohortItem>(tableOptions);

  return (
    <div className="flex flex-col ml-8 w-inherit">
      <span className="text-lg font-bold">{header}</span>
      <MantineReactTable table={table} />
    </div>
  );
};

export default QueriesTable;
