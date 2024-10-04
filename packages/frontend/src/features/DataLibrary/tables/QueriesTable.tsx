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
  selection: MRT_RowSelectionState;
  updateRowSelection: OnChangeFn<MRT_RowSelectionState>;
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

const QueriesTable = ({
  data,
  header,
  selection,
  updateRowSelection,
}: QueriesTableProps) => {
  const table = useMantineReactTable({
    columns,
    data: data,
    ...commonTableSettings,
    getRowId: (originalRow) => originalRow.name,
    onRowSelectionChange: updateRowSelection,
    state: { rowSelection: selection },
  });

  return (
    <div className="flex flex-col ml-8">
      <span className="text-lg font-bold">{header}</span>
      <MantineReactTable table={table} />
    </div>
  );
};

export default QueriesTable;
