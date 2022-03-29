import {usePagination, useSortBy, useTable} from "react-table"
import {Paper,ActionIcon, Select, Table, Text,NumberInput, Group } from "@mantine/core";
import {
    FaSort as SortIcon
} from "react-icons/fa";
import {
    MdArrowForwardIos as ArrowForward,
    MdArrowBackIos as ArrowBackward,
} from "react-icons/md";

interface TableProps {
    readonly columns: any;
    readonly data: any;
    readonly itemsPerPage?: number;
    readonly justify?: "left" | "center" | "right";
}

const MediumTable = ({columns, data, itemsPerPage=5, justify="left" } : TableProps) => {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: {pageIndex, pageSize}
    } = useTable(
        {
            columns,
            data,
            initialState: {pageIndex: 0, pageSize: itemsPerPage.toString()}
        },
        useSortBy,
        usePagination
    );

    5
    return (
        <div className="flex flex-col flex-grow justify-end flex-grow bg-gen3-smoke ">
            <Table {...getTableProps()} className="flex-2" >
                <thead>
                {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()} >
                        {headerGroup.headers.map((column) => (
                            <th {...column.getHeaderProps(
                                column.getSortByToggleProps())
                            }  >
                                <div className="flex flex-row justify-center">
                                <div className={`inline-flex align-center w-100 justify-center ${column.className}`}>
                                    <span >{column.render("Header")}</span>
                                    <span
                                        style={{
                                            marginBottom: "-.20em",
                                            marginLeft: "8px",
                                            marginTop: ".20em"
                                        }}
                                    >
                                        {column.isSorted ? <SortIcon/> : ""}
                                    </span>
                                </div>
                                </div>
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                {page.map((row, i) => {
                    prepareRow(row);
                    return (
                        <tr {...row.getRowProps()} className={`text-${justify}`} >
                            {row.cells.map((cell) => {
                                return (
                                    <td  {...cell.getCellProps()}>{cell.render("Cell")}</td>
                                );
                            })}
                        </tr>
                    );
                })}
                </tbody>
            </Table>
            <div className="flex-1 bg-gen3-rose">
                <Group position="right" spacing="sm" >
                    <Text className="font-montserrat text-sm">
                            {(pageIndex * pageSize)+1}-{Math.min((pageIndex+1)*pageSize, data.length)} of {data.length}
                    </Text>
                    <ActionIcon radius="md"
                        onClick={() => previousPage()}
                        disabled={!canPreviousPage}
                        classNames={{
                            default: "bg-white hover:bg-gen3-blue disabled:bg-white disabled:text-gen3-smoke",
                        }}
                    >
                        <ArrowBackward />
                    </ActionIcon>
                    <ActionIcon  radius="md"
                        onClick={() => nextPage()}
                        disabled={!canNextPage}
                                 classNames={{
                                     filled: "text-gen3-gray hover:bg-gen3-blue disabled:text-gen3-smoke",
                                 }}
                    >
                        <ArrowForward />
                    </ActionIcon>

                </Group>
            </div>

        </div>
    );
}

export default MediumTable;
