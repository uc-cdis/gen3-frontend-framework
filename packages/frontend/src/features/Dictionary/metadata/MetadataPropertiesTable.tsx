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

type PropertyTableRowData = Pick<
  MetadataElement,
  'id' | 'name' | 'type' | 'required' | 'description'
>;

interface MetadataPropertiesTableProps {
  elements: Array<MetadataElement>;
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
      if (element.minimum && element.maximum) {
        return (
          <span>
            {element.minimum} - {element.maximum}
          </span>
        );
      } else if (element.minimum) {
        return <span>{element.minimum}</span>;
      } else if (element.maximum) {
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
}: MetadataPropertiesTableProps) => {
  const columns = useMemo<Array<MRT_ColumnDef<MetadataElement>>>(() => {
    return [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 75,
        Cell: ({
          cell,
          row,
        }: {
          cell: MRT_Cell<PropertyTableRowData>;
          row: MRT_Row<PropertyTableRowData>;
        }) => {
          return <span>{cell.getValue<string>()}</span>;
        },
      },
      {
        accessorKey: 'type',
        header: 'Type',
      },
      {
        header: 'Values',
        Cell: ({ row }: { row: MRT_Row<PropertyTableRowData> }) => {
          return buildValueElements(row.original);
        },
      },
      {
        accessorKey: 'required',
        header: 'Required',
        size: 60,
        Cell: ({ cell }: { cell: MRT_Cell<PropertyTableRowData> }) => {
          if (cell.getValue<boolean>() === true) {
            return <Check className="text-green-500" />;
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
    getRowId: (originalRow: PropertyTableRowData) => originalRow.id,
    mantineTableHeadRowProps: {
      style: {
        '--mrt-base-background-color': 'var(--mantine-color-accent-cool-3)',
      },
    },
    mantineTableHeadCellProps: {
      style: {
        color: 'var(--mantine-color-accent-contrast-cool-3)',
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
