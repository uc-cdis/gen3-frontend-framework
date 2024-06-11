import React, { useMemo, useState } from 'react';
import { capitalize } from 'lodash';
import {
  MantineReactTable,
  MRT_Cell,
  MRT_Row,
  MRT_ColumnDef,
  useMantineReactTable,
  MRT_RowSelectionState,
} from 'mantine-react-table';
import { DictionaryProperty } from './types';
import { useDeepCompareEffect } from 'use-deep-compare';
import { List, ThemeIcon } from '@mantine/core';
import { FaCircle as DiscIcon } from 'react-icons/fa';

interface PropertyTableRowData {
  property: string;
  type: string;
  required: string;
  description: string;
  property_id: string;
}

interface PropertiesTableProps {
  properties: Record<string, DictionaryProperty>;
  required?: string[];
  category: string;
  subCategory: string;
  selectedProperty: string;
}

const PropertiesTable = ({
  properties,
  required,
  category,
  subCategory,
  selectedProperty,
}: PropertiesTableProps) => {
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  useDeepCompareEffect(() => {
    if (selectedProperty) setRowSelection({ [selectedProperty]: true });
    else setRowSelection({});
  }, [selectedProperty]);

  const columns = useMemo<Array<MRT_ColumnDef<PropertyTableRowData>>>(() => {
    return [
      /** TODO: add line to match design
       {
       id: 'decorator',
       header: '',
       Cell: ({ cell, row }: { cell: MRT_Cell; row: MRT_Row }) => {
       return <LineCell />;
       },
       },
       */
      {
        accessorKey: 'property',
        header: 'Property',
        size: 75,
        Cell: ({
          cell,
          row,
        }: {
          cell: MRT_Cell<PropertyTableRowData>;
          row: MRT_Row<PropertyTableRowData>;
        }) => {
          return (
            <span id={`${category}-${subCategory}-${row.original.property_id}`}>
              {cell.getValue<string>()}
            </span>
          );
        },
      },
      {
        accessorKey: 'type',
        header: 'Type(s)',
        size: 90,
        Cell: ({
          cell,
          row,
        }: {
          cell: MRT_Cell<PropertyTableRowData>;
          row: MRT_Row<PropertyTableRowData>;
        }) => {
          return (
            <List
              center
              classNames={{
                itemWrapper: 'flex items-center',
              }}
              icon={<DiscIcon size="0.5rem" />}
              id={`${category}-${subCategory}-${row.original.property_id}-list`}
            >
              <List.Item>{cell.getValue<string>()}</List.Item>
            </List>
          );
        },
      },
      {
        accessorKey: 'required',
        header: 'Required',
        size: 60,
      },
      {
        accessorKey: 'description',
        header: 'Description',
      },
    ];
  }, []);

  console.log('rowSelection', rowSelection);

  const tableData = useMemo(() => {
    const keys = properties ? Object.keys(properties ?? {}) : [];
    return keys.length
      ? keys.map((k) => {
          if (!properties || !Object.keys(properties).includes(k))
            return {
              property: '',
              type: '',
              required: 'No',
              description: '',
              property_id: k,
            } as PropertyTableRowData;
          const row = properties[k];
          return {
            property_id: k,
            property: k
              .split('_')
              .map((name) => capitalize(name))
              .join(' '),
            type: Object.keys(row).includes('anyOf')
              ? row.anyOf?.map(({ type }) => type).join(' ')
              : row.type,
            required: required?.includes(k) ? 'Required' : 'No',
            description:
              row?.description ?? row?.term?.description ?? 'No Description',
          } as PropertyTableRowData;
        })
      : ([] as PropertyTableRowData[]);
  }, []);
  const table = useMantineReactTable<PropertyTableRowData>({
    columns,
    data: tableData,
    enablePagination: false,
    enableBottomToolbar: false,
    enableTopToolbar: false,
    selectDisplayMode: 'switch',
    mantineTableBodyProps: {
      sx: {},
    },
    getRowId: (originalRow: PropertyTableRowData, index: number) =>
      originalRow.property_id,
    mantineTableBodyRowProps: ({ row }) => ({
      sx: (theme) => {
        if (Object.keys(rowSelection).includes(row.original.property_id)) {
          console.log('found');
        }
        const res = {
          ...(Object.keys(rowSelection).includes(row.original.property_id)
            ? {
                backgroundColor: '#ffee00',
              }
            : {}),
          borderWidth: 2,
        };
        if (Object.keys(rowSelection).includes(row.original.property_id)) {
          console.log('found', res);
        }
        return res;
      },
    }),
    state: { rowSelection },
    mantineTableHeadRowProps: {
      bg: 'rgb(206, 203, 228)',
    },
    mantineTableProps: {
      sx: {
        borderSpacing: '0rem 0rem',
        borderCollapse: 'separate',
        tableLayout: 'fixed',
      },
    },
  });

  return <MantineReactTable table={table} />;
};

export default React.memo(PropertiesTable);
