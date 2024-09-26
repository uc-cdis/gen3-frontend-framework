import { MantineReactTable } from 'mantine-react-table';

import FilesTable from './FilesTable';
import AdditionalDataTable from './AdditionalDataTable';
import QueriesTable from './QueriesTable';

const columns = [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'id',
    header: 'ID',
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
  data: any;
  setList: any;
}

const ListsTable = ({ data, setList }: ListsTableProps) => {
  return (
    <div className="flex flex-col ml-8 w-inherit w-11/12">
      <div>
        <MantineReactTable
          columns={columns}
          data={data}
          enableColumnResizing
          enableBottomToolbar={false}
          renderDetailPanel={({ row }) => (
            <div className="w-11/12">
              {setList?.[row.id]?.files.length > 0 && (
                <FilesTable header={'Files'} data={setList?.[row.id]?.files} />
              )}
              {setList?.[row.id]?.additionalData.length > 0 && (
                <AdditionalDataTable
                  header={'Additional Data'}
                  data={setList?.[row.id]?.additionalData}
                />
              )}
              {setList?.[row.id]?.queries.length > 0 && (
                <QueriesTable
                  header="Queries"
                  data={setList?.[row.id]?.queries}
                />
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default ListsTable;
