import React, { useCallback, useState } from 'react';
import type {
  MRT_ColumnDef,
  MRT_Row,
  MRT_RowSelectionState,
  MRT_Updater,
} from 'mantine-react-table-open';
import {
  MantineReactTable,
  type MRT_ColumnOrderState,
  MRT_ShowHideColumnsButton,
  useMantineReactTable,
} from 'mantine-react-table-open';
import type { ValidatedSelectedItem } from '../types';
import { IconSize } from '../../../utils/sizes';
import { isCohortItem } from '@gen3/core';
import { Text, Tooltip } from '@mantine/core';
import { filesize } from 'filesize';
import { TableIcons } from '../../../components/Tables/TableIcons';
import { Icon } from '@iconify-icon/react';
import { useDeepCompareMemo } from 'use-deep-compare';
import TableHeader from '../../../components/Tables/TableHeader';
import type { TableSearchOrPaginationProps } from '../../../components/Tables/types';

interface SelectedItemsTableRow {
  datasetName: string;
  datasetId: string;
  type: string;
  size?: string;
  name?: string;
  description?: string;
  valid?: boolean;
  messages?: string[];
}

const createColumns = (size: string, iconSize: number) => {
  const columns: MRT_ColumnDef<SelectedItemsTableRow>[] = [
    {
      accessorKey: 'valid',
      enableHiding: true,
      size: 40,
      maxSize: 50,
      header: 'Valid',
      Cell: ({ row }: { row: MRT_Row<SelectedItemsTableRow> }) => {
        if (row.original.valid === undefined) return <span />;
        if (!row.original.valid) {
          return (
            <Tooltip
              label={row.original?.messages?.join('\n') ?? 'Unknown Error'}
            >
              <Icon
                icon="gen3:warning"
                width={iconSize}
                height={iconSize}
                className="text-utility-warning text-xl"
              >
                <Text fw={400} size={size}>
                  {row.original?.messages?.length}
                </Text>
              </Icon>
            </Tooltip>
          );
        } else {
          return (
            <Icon
              icon="gen3:check-fill"
              width={iconSize}
              height={iconSize}
              className="text-utility-success"
            />
          );
        }
      },
    },
    {
      accessorKey: 'id',
      header: 'Id',
      size: 150,
      maxSize: 250,
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'datasetId',
      header: 'Dataset',
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
      accessorKey: 'size',
      header: 'Size',
      Cell: ({ row }) => (
        <Text>{row.original.size ? filesize(row.original.size) : 'N/A'}</Text>
      ),
    },
  ];

  return columns;
};

const createRowsFromItems = (items: ReadonlyArray<ValidatedSelectedItem>) => {
  let hasInvalidRows = false;

  const rows = items.map((item) => {
    if (!item.valid) hasInvalidRows = true;
    if (isCohortItem(item)) {
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        type: item.itemType as string,
        size: undefined,
        datasetName: item.datasetName,
        datasetId: item.datasetId,
        valid: item.valid,
        messages: item?.errorMessages,
      } as SelectedItemsTableRow;
    }

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type,
      size: item.size,
      datasetId: item.datasetId,
      datasetName: item.datasetName,
      valid: item.valid,
      messages: item?.errorMessages,
    } as SelectedItemsTableRow;
  });

  return {
    rows,
    hasInvalidRows,
  };
};

interface CheckoutFileTableProps {
  items: ReadonlyArray<ValidatedSelectedItem>;
  rowSelection: MRT_RowSelectionState;
  setRowSelection: React.Dispatch<React.SetStateAction<MRT_RowSelectionState>>;
  size?: string;
}

export const CheckoutFilesTable = ({
  items,
  rowSelection,
  setRowSelection,
  size = 'sm',
}: CheckoutFileTableProps) => {
  const handleRowSelectionChange = (
    updater: MRT_Updater<MRT_RowSelectionState>,
  ) => {
    let value = {};
    setRowSelection((prevSelection) => {
      value = updater instanceof Function ? updater(prevSelection) : updater;
      return value;
    });
  };

  const iconSize = IconSize[size] || IconSize['sm'];

  const columns = useDeepCompareMemo(
    () => createColumns(size, iconSize),
    [size, iconSize],
  );

  // TODO: add support for searching
  const handleSearchOrPageChange = useCallback(
    (_params: TableSearchOrPaginationProps) => null,
    [],
  );

  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(
    columns.map((column: any) => column.accessorKey), //must start out with a populated columnOrder
  );

  console.log('columnOrder', columnOrder);
  const tableRows = useDeepCompareMemo(
    () => createRowsFromItems(items),
    [items],
  );

  const table = useMantineReactTable<SelectedItemsTableRow>({
    columns,
    data: tableRows.rows,
    icons: TableIcons,
    enableTopToolbar: false,
    enableRowSelection: true,
    enableBottomToolbar: tableRows.rows.length > 10,
    enablePagination: tableRows.rows.length > 10,
    enableRowActions: false,
    enableColumnResizing: true,
    enableGrouping: false,
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableHiding: true,
    enableColumnActions: false,
    enableColumnFilters: false,
    paginateExpandedRows: false,
    onRowSelectionChange: handleRowSelectionChange,
    state: {
      rowSelection,
      columnOrder: ['mrt-row-selection', ...columnOrder, 'mrt-row-actions'],
    },
    initialState: {
      density: 'xs',
      columnPinning: {
        left: ['mrt-row-select'],
        right: ['mrt-row-actions'],
      },
    },
    layoutMode: 'semantic',
    mantineDetailPanelProps: {
      style: {
        boxShadow: '0 -2px 0px 0px var(--table-border-color) inset',
      },
    },
    mantineTableProps: {
      style: {
        backgroundColor: 'var(--mantine-color-base-1)',
        '--mrt-striped-row-background-color': 'var(--mantine-color-base-3)',
      },
    },
    mantineTableHeadCellProps: {
      style: {
        backgroundColor: 'var(--mantine-color-table-1)',
        color: 'var(--mantine-color-table-contrast-1)',
        textAlign: 'center',
        padding: '0.25rem 0.5rem 0.25rem 0.5rem',
        fontWeight: 600,
        fontSize: `var(--mantine-font-size-${size})`,
      },
    },
    renderToolbarInternalActions: ({ table }) => (
      <>
        {/* Re-rendering the built-in show/hide toggle alongside custom elements */}
        <MRT_ShowHideColumnsButton table={table} />
      </>
    ),
  });

  return (
    <div className="flex flex-col ml-8">
      <TableHeader
        table={table}
        columnOrder={columnOrder}
        setColumnOrder={setColumnOrder}
        handleChange={handleSearchOrPageChange}
        tableTitle="Files"
        showControls={true}
        noColumnOrdering={['mrt-row-select', 'mrt-row-actions']}
        size={size}
      />
      <MantineReactTable table={table} />
    </div>
  );
};

export default CheckoutFilesTable;
