import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { useMemo } from "react";

interface QueriesTableProps {
    data: any;
    header: string;
}

const QueriesTable = ({ data, header }: QueriesTableProps) => {
    const columns = useMemo(() => {
        return [
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
    }, []);
    const table = useMantineReactTable<any>({
        columns,
        data: data,
        enableTopToolbar: false,
        enableBottomToolbar: false,
        enableColumnResizing: true,
        columnResizeMode: 'onEnd',
    });

    return <div className='flex flex-col ml-8 w-inherit'>
        <span className='text-lg font-bold'>{header}</span>
        <div>
            <MantineReactTable table={table} />
        </div>
    </div>;
};

export default QueriesTable;
