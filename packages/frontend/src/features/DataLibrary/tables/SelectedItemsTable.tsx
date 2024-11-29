import React, { useMemo } from 'react';
import {
  MantineReactTable,
  MRT_RowSelectionState,
  MRT_Updater,
  MRT_Cell,
  useMantineReactTable,
  MRT_Row,
} from 'mantine-react-table';
import { useDeepCompareMemo } from 'use-deep-compare';
import { Text, Tooltip } from '@mantine/core';
import { Icon } from '@iconify/react';
import { isCohortItem } from '@gen3/core';
import { TableIcons } from '../../../components/Tables/TableIcons';
import { ValidatedSelectedItem } from '../types';
import { IconSize } from '../types';

interface SelectedItemsTableHeaderProps {
  numberOfItems: number;
  numberOfWarnings: number;
  size?: string;
}

const SelectedItemsTableHeader: React.FC<SelectedItemsTableHeaderProps> = ({
  numberOfItems,
  numberOfWarnings,
  size = 'sm',
}) => {
  const iconSize = IconSize[size] || IconSize['sm'];
  return (
    <div className="flex items-center bg-primary-darker  px-4 py-2 mt-2 min-h-10 text-heading">
      {numberOfItems > 0 && (
        <div className="flex items-center flex-nowrap overflow-ellipsis text-primary-contrast-darker">
          <Text fw={600} size={size} className="mr-1 ">
            {numberOfItems}
          </Text>
          <Text
            fw={400}
            size={size}
            className="mr-1 text-primary-contrast-lighter"
          >
            selected
          </Text>
        </div>
      )}
      {numberOfItems > 0 && numberOfWarnings > 0 && (
        <Icon
          icon="gen3:dot"
          className="text-primary-contrast-lighter"
          width={iconSize}
          height={iconSize}
        />
      )}
      {numberOfWarnings > 0 && (
        <div className="flex items-center flex-nowrap overflow-ellipsis">
          <Icon
            icon="gen3:warning"
            width={iconSize}
            height={iconSize}
            className="text-utility-warning m-1"
          ></Icon>
          <Text
            fw={600}
            size={size}
            className="mr-1 text-primary-contrast-lighter"
          >
            {numberOfWarnings}
          </Text>
          <Text
            fw={400}
            size={size}
            className="text-primary-contrast-lighter"
          >{`${numberOfWarnings == 1 ? 'warning' : 'warnings'}`}</Text>
        </div>
      )}
    </div>
  );
};

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

interface SelectedItemsTableProps {
  validatedItems: ReadonlyArray<ValidatedSelectedItem>;
  rowSelection: MRT_RowSelectionState;
  setRowSelection: React.Dispatch<React.SetStateAction<MRT_RowSelectionState>>;
  size?: string;
}

const SelectedItemsTable: React.FC<SelectedItemsTableProps> = ({
  validatedItems,
  rowSelection,
  setRowSelection,
  size = 'sm',
}) => {
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

  const columns = useMemo(
    () => [
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
                  className="text-yellow-400 text-xl"
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
                icon="gen3:check"
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
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 150,
        maxSize: 250,
        Cell: ({ cell }: { cell: MRT_Cell<SelectedItemsTableRow> }) => {
          return (
            <Text fw={400} size={size} lineClamp={2}>
              {cell.getValue<string>() ?? 'N/A'}
            </Text>
          );
        },
      },
      {
        accessorKey: 'type',
        header: 'Type',
      },
      {
        accessorKey: 'size',
        header: 'Size',
      },
      {
        accessorKey: 'datasetId',
        header: 'Dataset ID',
      },
    ],
    [iconSize, size],
  );

  const tableRows = useDeepCompareMemo(() => {
    let hasInvalidRows = false;
    const rows = validatedItems.map((item) => {
      if (!item.valid) hasInvalidRows = true;
      if (isCohortItem(item)) {
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          type: item.itemType as string,
          size: undefined,
          datasetName: item.name,
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
  }, [validatedItems]);

  const table = useMantineReactTable<SelectedItemsTableRow>({
    columns,
    data: tableRows.rows,
    enableColumnResizing: false,
    icons: TableIcons,
    enableTopToolbar: false,
    enableRowSelection: true,
    enableBottomToolbar: tableRows.rows.length > 10,
    enablePagination: tableRows.rows.length > 10,
    enableRowActions: false,
    enableStickyFooter: true,
    enableStickyHeader: true,
    enableHiding: true,
    onRowSelectionChange: handleRowSelectionChange,
    state: { rowSelection },
    initialState: {
      density: 'xs',
      columnPinning: {
        left: ['mrt-row-select', 'mrt-row-expand'],
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
        fontSize: 'var(--mantine-font-size-sm)',
      },
    },
  });

  return (
    <div className="flex flex-col ml-8">
      <SelectedItemsTableHeader
        numberOfItems={Object.keys(rowSelection).length}
        numberOfWarnings={
          tableRows.rows.filter((x) => x.valid === false).length
        }
        size={size}
      />
      <div className="mt-2">
        <MantineReactTable table={table} />
      </div>
    </div>
  );
};

export default SelectedItemsTable;
