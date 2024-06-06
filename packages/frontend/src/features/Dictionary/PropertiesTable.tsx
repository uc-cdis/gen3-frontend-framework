import React, { useMemo } from 'react';
import { capitalize } from 'lodash';
import {
  MantineReactTable,
  MRT_Cell,
  useMantineReactTable,
} from 'mantine-react-table';
import Cell from './Cell';
import { DictionaryProperty } from './types';

interface PropertyTableRowData {
  property: string;
  type: string;
  required: string;
  description: string;
}

interface PropertiesTableProps {
  properties: Record<string, DictionaryProperty>;
  required?: string[];
}

const PropertiesTable = ({ properties, required }: PropertiesTableProps) => {
  const columns = useMemo(() => {
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
      ...['property', 'type', 'required', 'description'].map((key) => ({
        accessorKey: key,
        header: key.toLocaleUpperCase(),
        Cell: ({ cell }: { cell: MRT_Cell<PropertyTableRowData> }) => (
          <Cell cell={cell} key={key} />
        ),
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
            } as PropertyTableRowData;
          const row = properties[k];
          return {
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
    mantineTableHeadRowProps: {
      bg: 'rgb(206, 203, 228)',
    },
    mantineTableBodyRowProps: {
      sx: {
        borderWidth: 2,
      },
    },
    mantineTableProps: {
      striped: true,
      sx: {
        borderSpacing: '0rem 0rem',
        borderCollapse: 'separate',
      },
    },
  });

  console.log('properties table');

  return <MantineReactTable table={table} />;
};

export default React.memo(PropertiesTable);
