import React, { useEffect } from 'react';
import {
  MantineReactTable,
  useMantineReactTable,
} from 'mantine-react-table-open';
import { JSONObject } from '@gen3/core';
import type { ExplorerTableSubTableProps } from './types';
import { TableIcons } from '../../../../components/Tables/TableIcons';

const ExplorerTableSubTable = ({
  columns,
  data,
  setHeaderHeight = () => {},
}: ExplorerTableSubTableProps) => {
  const table = useMantineReactTable<JSONObject>({
    columns: columns,
    data: data ?? [],
    enablePagination: false,
    enableTableFooter: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableColumnResizing: false,
    enableColumnActions: false,
    icons: TableIcons,
    layoutMode: 'grid-no-grow',
    defaultColumn: {
      minSize: 300,
      maxSize: 1000,
      size: 360,
    },
    mantinePaperProps: {
      className: 'border-accent-max rounded-none',
    },
    mantineTableProps: {
      className: 'relative z-[1]',
    },
    mantineTableHeadCellProps: {
      className:
        'border-r border-accent-max bg-secondary-lightest font-color-secondary-contrast-lightest',
    },
    mantineTableBodyCellProps: {
      className: 'border-r border-accent-max',
    },
  });

  useEffect(() => {
    // Function to measure the header height
    const updateHeaderHeight = () => {
      if (table.refs.tableHeadRef.current) {
        // Get the height of the header cell
        const height =
          table.refs.tableHeadRef.current.getBoundingClientRect().height;
        setHeaderHeight(height);
      }
    };

    // Initial measurement
    updateHeaderHeight();

    // Set up a resize observer to handle dynamic changes
    const resizeObserver = new ResizeObserver(updateHeaderHeight);

    if (table.refs.tableHeadRef.current) {
      resizeObserver.observe(table.refs.tableHeadRef.current);
    }

    // Clean up
    return () => {
      if (table.refs.tableHeadRef.current) {
        resizeObserver.unobserve(table.refs.tableHeadRef.current);
      }
    };
  }, [table.refs.tableHeadRef, setHeaderHeight]);

  return <MantineReactTable table={table} />;
};

export default ExplorerTableSubTable;
