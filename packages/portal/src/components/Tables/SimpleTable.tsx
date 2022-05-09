import {usePagination, useSortBy, useTable, Column} from 'react-table';
import { ActionIcon, Table, Text,} from '@mantine/core';
import {
  FaSort as SortIcon
} from 'react-icons/fa';
import {
  MdArrowForwardIos as ArrowForward,
  MdArrowBackIos as ArrowBackward,
} from 'react-icons/md';
import TableScrollbar from './TableScrollbar';

export type StyledColumn = Column<object> & {
    readonly className?:string;
}

interface TableProps {
    readonly columns: ReadonlyArray<StyledColumn>;
    readonly data: ReadonlyArray<object>;
    readonly itemsPerPage?: number;
    readonly justify?: 'left' | 'center' | 'right';
    readonly tableStyle?: {
        readonly container?: string;
        readonly table?: string;
        readonly thead?: string;
        readonly headTr?: string;
        readonly th?: string;
        readonly tbody?: string;
        readonly td?: string;
    }
}


const SimpleTable = ({columns, data, itemsPerPage=5, justify='left', tableStyle } : TableProps) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    nextPage,
    previousPage,
    state : { pageIndex, pageSize  }
  } = useTable(
    {
      columns,
      data,
      initialState: {pageIndex: 0, pageSize: itemsPerPage}
    },
    useSortBy,
    usePagination
  );

  return (
    <div className={`flex flex-col h-full ${tableStyle?.container || ''}`}>
      <TableScrollbar rows={5}>
        <Table {...getTableProps()}  horizontalSpacing='xs' className={tableStyle?.table} >
          <thead className={tableStyle?.thead} >
            {headerGroups.map((headerGroup, idx) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={idx} className={tableStyle?.headTr}>
                {headerGroup.headers.map((column, idx) => (
                  <th {...column.getHeaderProps(
                    column.getSortByToggleProps())
                  } className={`p-0 ${tableStyle?.th || ''}`} key={idx}>
                    <div className={'p-0'}>
                      <span className='c'>{column.render('Header')}</span>
                      <span
                        style={{
                          marginBottom: '-.20em',
                          marginLeft: '8px',
                          marginTop: '.20em'
                        }}
                      >
                        {column.isSorted ? <SortIcon/> : ''}
                      </span>
                    </div>

                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody {...getTableBodyProps()} className={tableStyle?.tbody}>
            {page.map((row, idx) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className={`text-${justify}`} key={idx}>
                  {row.cells.map((cell, idx) => {
                    return (
                      <td  {...cell.getCellProps()} key={idx} className={tableStyle?.td}>{cell.render('Cell')}</td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

        </Table>
      </TableScrollbar>

      <div className='mt-auto border-t'>
        <div className='flex flex-row justify-end items-center'  >
          <Text className='font-montserrat text-sm mr-8'>
            {(pageIndex * pageSize)+1}-{Math.min((pageIndex+1)*pageSize, data.length)} of {data.length}
          </Text>
          <ActionIcon radius='md'
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            classNames={{
              default: 'bg-white hover:bg-gen3-blue disabled:bg-white disabled:text-gen3-smoke',
            }}
          >
            <ArrowBackward />
          </ActionIcon>
          <ActionIcon  radius='md'
            onClick={() => nextPage()}
            disabled={!canNextPage}
            classNames={{
              filled: 'text-gen3-gray hover:bg-gen3-blue disabled:text-gen3-smoke',
            }}
          >
            <ArrowForward />
          </ActionIcon>

        </div>
      </div>
    </div>
  );
};

export default SimpleTable;
