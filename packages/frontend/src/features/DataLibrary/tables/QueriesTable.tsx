import {
  MantineReactTable,
  MRT_RowSelectionState,
  useMantineReactTable,
} from 'mantine-react-table';
import { ColumnResizeMode } from '@tanstack/react-table';
import { CohortItem } from '@gen3/core';
import { TableIcons } from '../../../components/Tables/TableIcons';
import { commonTableSettings } from './tableSettings';
import { OnChangeFn } from '@tanstack/table-core';

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
  const table = useMantineReactTable({
    columns,
    data: data,
    ...commonTableSettings,
    getRowId: (originalRow) => originalRow.name,
    enableRowSelection: false,
    enableBottomToolbar: false,
    enablePagination: false,
  });

  return (
    <div className="flex flex-col ml-8">
      <span className="text-lg font-bold">{header}</span>
      <MantineReactTable table={table} />
    </div>
  );
};

export default QueriesTable;
