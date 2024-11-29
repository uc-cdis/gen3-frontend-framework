import {
  MantineReactTable,
  MRT_RowSelectionState,
  useMantineReactTable,
} from 'mantine-react-table';
import { CohortItem } from '@gen3/core';
import { Text } from '@mantine/core';
import { commonTableSettings } from './tableSettings';
import { MantineSizeToString } from '../types';
import { getNextSize } from '../utils';

interface QueriesTableProps {
  data: Array<CohortItem>;
  header: string;
  size?: string;
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

const QueriesTable = ({ data, header, size = 'sm' }: QueriesTableProps) => {
  const table = useMantineReactTable({
    columns,
    data: data,
    ...commonTableSettings(size),
    getRowId: (originalRow) => originalRow.name,
    enableRowSelection: false,
    enableBottomToolbar: false,
    enablePagination: false,
  });

  return (
    <div className="flex flex-col ml-8">
      <Text fw={600} fs={size} c="secondary.5" tt="uppercase">
        {header}
      </Text>
      <MantineReactTable table={table} />
    </div>
  );
};

export default QueriesTable;
