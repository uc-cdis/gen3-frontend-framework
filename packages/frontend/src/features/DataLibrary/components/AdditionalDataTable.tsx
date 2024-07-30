import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import {  useMemo } from "react";

interface AdditionalDataTableTableProps {
    data: any;
    header: string;
}

const AdditionalDataTableTable = ({ data, header }: AdditionalDataTableTableProps) => {
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
                accessorKey: 'documentation',
                header: 'Documentation',
            }
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

export default AdditionalDataTableTable;
