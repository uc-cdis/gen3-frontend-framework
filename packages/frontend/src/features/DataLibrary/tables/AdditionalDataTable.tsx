import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { commonTableSettings } from './tableSettings';

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
    accessorKey: 'documentation',
    header: 'Documentation',
  },
];

interface AdditionalDataTableTableProps {
  data: any;
  header: string;
}

const AdditionalDataTableTable = ({
  data,
  header,
}: AdditionalDataTableTableProps) => {
  const table = useMantineReactTable({
    columns,
    data: data,
    ...commonTableSettings,
    enableRowActions: false,
    enableRowSelection: false,
  });

  return (
    <div className="flex flex-col ml-8 w-inherit">
      <span className="text-lg font-bold">{header}</span>
      <div>
        <MantineReactTable table={table} />
      </div>
    </div>
  );
};

export default AdditionalDataTableTable;
