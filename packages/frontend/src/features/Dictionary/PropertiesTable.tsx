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
}

const PropertiesTable = ({
  properties,
  required,
  category,
  subCategory,
}: PropertiesTableProps) => {
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
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
        Cell: ({
          cell,
          row,
        }: {
          cell: MRT_Cell<PropertyTableRowData>;
          row: MRT_Row<PropertyTableRowData>;
        }) => {
          return (
            <span
              id={`${category}-${subCategory}-${
                (row.original as PropertyTableRowData).property_id
              }`}
            >
              {cell.getValue<string>()}
            </span>
          );
        },
      },
      ...['type', 'required', 'description'].map((key) => ({
        accessorKey: key,
        header: key.toLocaleUpperCase(),
      })),
    ];
  }, []);

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
    mantineTableBodyRowProps: ({ row }) => ({
      //implement row selection click events manually
      onClick: () =>
        setRowSelection((prev) => ({
          ...prev,
          [row.id]: !prev[row.id],
        })),
      selected: rowSelection[row.id],
      sx: {
        cursor: 'pointer',
        borderWidth: 2,
      },
    }),
    state: { rowSelection },
    mantineTableHeadRowProps: {
      bg: 'rgb(206, 203, 228)',
    },
    mantineTableProps: {
      striped: true,
      sx: {
        borderSpacing: '0rem 0rem',
        borderCollapse: 'separate',
      },
    },
  });

  return <MantineReactTable table={table} />;
};

export default React.memo(PropertiesTable);
