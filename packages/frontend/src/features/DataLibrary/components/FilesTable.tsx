import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { useEffect, useMemo } from "react";

interface FilesTableProps {
    data: any;
    header: string;
}

const FilesTable = ({ data, header }: FilesTableProps) => {
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
            {
                accessorKey: "size",
                header: "Size"
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

export default FilesTable;
