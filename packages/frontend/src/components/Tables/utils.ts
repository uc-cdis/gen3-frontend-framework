import { humanify, JSONObject } from '@gen3/core';
import { JSONPath } from 'jsonpath-plus';
import { saveAs } from 'file-saver';
import {
  MRT_Column,
  MRT_ColumnOrderState,
  MRT_RowData,
  MRT_VisibilityState,
} from 'mantine-react-table';

export const jsonPathAccessor = (path: string) => (row: JSONObject) => {
  // TODO: add logging if path is not found
  console.log('jsonPathAccessor', path, row);
  const results = JSONPath({ json: row, path: path });
  console.log('jsonPathAccessor', results);
  return results;
};

export function downloadTSV<TData extends MRT_RowData>({
  tableData,
  columns,
  columnOrder,
  columnVisibility,
  fileName,
  option,
}: {
  tableData: TData[];
  columns: MRT_Column<TData>[];
  columnOrder?: MRT_ColumnOrderState;
  columnVisibility?: MRT_VisibilityState;
  fileName: string;
  option?: {
    // should be ids of the column
    blacklist?: string[];
    overwrite?: Record<
      string, // should be id of the column
      {
        header?: string;
        composer?: (data: TData) => void;
      }
    >;
  };
}): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      // Filter columns based on blackList and columnVisibility
      const filteredColumns = columns.filter((column) => {
        const columnId = column.id;
        return (
          !option?.blacklist?.includes(columnId) &&
          !(columnVisibility?.[columnId] === false)
        );
      });

      // Sort columns based on columnOrder
      const sortedColumns = (columnOrder || columns.map((column) => column.id))
        ?.map((columnId) => {
          const foundColumn = filteredColumns.find(
            (column) => column.id === columnId,
          );
          return foundColumn ? foundColumn : null;
        })
        .filter((column) => column !== null);

      const header = sortedColumns
        .map((column) =>
          typeof column?.header === 'string'
            ? column.header
            : humanify({ term: column.id }),
        )
        .join('\t');

      const body = (tableData || [])
        .map((datum) =>
          sortedColumns
            .map((column) => {
              const composer = option?.overwrite?.[column.id]?.composer;
              return composer ? composer(datum) : datum?.[column.id];
            })
            .join('\t'),
        )
        .join('\n');

      const tsv = [header, body].join('\n');
      const blob = new Blob([tsv], { type: 'text/tsv' });

      saveAs(blob, fileName);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
