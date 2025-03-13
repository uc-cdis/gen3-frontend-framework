import React, { useMemo } from 'react';
import {
  MantineReactTable,
  MRT_Cell,
  MRT_Row,
  MRT_ColumnDef,
  useMantineReactTable,
} from 'mantine-react-table';
import { MetadataElement } from './types';
import { List } from '@mantine/core';
import { FaCircle as DiscIcon, FaCheck as Check } from 'react-icons/fa';
import { TableIcons } from '../../../components/Tables/TableIcons';

type PropertyTableRowData = Pick<
  MetadataElement,
  'id' | 'name' | 'type' | 'required' | 'description'
>;

interface MetadataPropertiesTableProps {
  elements: Array<MetadataElement>;
  fontSize?: string;
}

const buildValueElements = (element: MetadataElement) => {
  switch (element.type) {
    case 'string':
      return <span />;
    case 'enum':
      return (
        <List
          size="sm"
          spacing="xs"
          center
          classNames={{
            itemWrapper: 'flex items-center',
          }}
          icon={<DiscIcon size="0.5rem" />}
          id={`${element.id}-enum-value-list`}
        >
          {element?.enum?.map((value) => (
            <List.Item key={`value-enum-${element.id}-${value}`}>
              {value}
            </List.Item>
          ))}
        </List>
      );
    case 'number':
      if (element?.minimum !== undefined && element?.maximum !== undefined) {
        return (
          <span>
            {element.minimum} - {element.maximum}
          </span>
        );
      } else if (element?.minimum !== undefined) {
        return <span>{element.minimum}</span>;
      } else if (element?.maximum !== undefined) {
        return <span>{element.minimum}</span>;
      } else {
        return null;
      }
    default:
      return null;
  }
};

const MetadataPropertiesTable = ({
  elements,
  fontSize = 'sm',
}: MetadataPropertiesTableProps) => {
  const columns = useMemo<Array<MRT_ColumnDef<MetadataElement>>>(() => {
    return [
      {
        accessorKey: 'name',
        header: 'Name',
        Cell: ({ cell }: { cell: MRT_Cell<PropertyTableRowData> }) => {
          return <span>{cell.getValue<string>()}</span>;
        },
        size: 120,
        maxSize: 180,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        size: 120,
      },
      {
        header: 'Values',
        Cell: ({ row }: { row: MRT_Row<PropertyTableRowData> }) => {
          return buildValueElements(row.original);
        },
        size: 120,
      },
      {
        accessorKey: 'required',
        header: 'Required',
        size: 80,
        Cell: ({ cell }: { cell: MRT_Cell<PropertyTableRowData> }) => {
          if (cell.getValue<boolean>() === true) {
            return <Check className="text-utility-success" />;
          }
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
      },
    ];
  }, []);

  const table = useMantineReactTable<PropertyTableRowData>({
    columns,
    data: elements,
    enablePagination: false,
    enableBottomToolbar: false,
    enableTopToolbar: false,
    enableRowSelection: false,
    enableColumnActions: false,
    enableColumnResizing: true,
    layoutMode: 'grid',
    icons: TableIcons,
    getRowId: (originalRow: PropertyTableRowData) => originalRow.id,
    mantineTableProps: {
      style: {
        tableLayout: 'fixed',
        'mrt-table-head-cell-resize-handle': '#FF0000',
      },
    },
    mantineTableHeadRowProps: {
      style: {
        '--mrt-base-background-color': 'var(--mantine-color-accent-cool-2)',
        fontSize: `var(--mantine-font-size-${fontSize})`,
      },
    },
    mantineTableHeadCellProps: {
      style: {
        color: 'var(--mantine-color-accent-contrast-cool-2)',
        fontSize: `var(--mantine-font-size-${fontSize})`,
        '--mantine-color-placeholder': 'var(--mantine-color-accent-4)',
        '--resize-handle-thickness': 10,
      },
    },
  });

  return (
    <div className="grow w-auto inline-block overflow-x-scroll">
      <MantineReactTable table={table} />
    </div>
  );
};

export default React.memo(MetadataPropertiesTable);
