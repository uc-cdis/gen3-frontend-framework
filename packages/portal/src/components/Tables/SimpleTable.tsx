import { useState, useRef, useCallback, useEffect } from 'react';
import {usePagination, useSortBy, useTable} from "react-table";
import {Paper, Stack, ActionIcon, Select, Table, Text, NumberInput, Group } from "@mantine/core";
import {
    FaSort as SortIcon
} from "react-icons/fa";
import {
    MdArrowForwardIos as ArrowForward,
    MdArrowBackIos as ArrowBackward,
} from "react-icons/md";
import TableScrollbar from "./TableScrollar";

interface TableProps {
    readonly columns: any;
    readonly data: any;
    readonly itemsPerPage?: number;
    readonly justify?: "left" | "center" | "right";
}

const useStickyHeader = (defaultSticky = false) => {
    const [isSticky, setIsSticky] = useState(defaultSticky);
    const tableRef = useRef(null);

    const handleScroll = useCallback(({ top, bottom }) => {
        if (top <= 0 && bottom > 2 * 68) {
            !isSticky && setIsSticky(true);
        } else {
            isSticky && setIsSticky(false);
        }
    }, [isSticky]);

    useEffect(() => {
        const handleScroll = () => {
            handleScroll(tableRef.current.getBoundingClientRect());
        };
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll]);

    return { tableRef, isSticky };
};

const SimpleTable = ({columns, data, itemsPerPage=5, justify="left" } : TableProps) => {
    // @ts-ignore
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageCount,
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

    return (
        <div className="flex flex-col h-full" >
            <TableScrollbar rows={5}>
            <Table {...getTableProps()}  horizontalSpacing="xs" >
                <thead   >
                {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()} className="bg-white" >
                        {headerGroup.headers.map((column) => (
                            <th {...column.getHeaderProps(
                                column.getSortByToggleProps())
                            } className="p-0">

                                <div className={`p-0  ${column.className}`}>
                                    <span className="c">{column.render("Header")}</span>
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
            </TableScrollbar>

            <div className="mt-auto border-t">
                <div className="flex flex-row justify-end items-center"  >
                    <Text className="font-montserrat text-sm mr-8">
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

                </div>
            </div>
        </div>
    );
}

export default SimpleTable;
