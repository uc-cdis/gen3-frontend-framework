import { fieldNameToTitle } from '@gen3/core';
import { ColumnDefinition, SummaryTableColumn } from './types';
import { JSONPath } from 'jsonpath-plus';
import { MRT_Row } from 'mantine-react-table';

export const convertGuppyTableConfig = (
  config: ReadonlyArray<SummaryTableColumn>,
): ColumnDefinition[] => {
  // convert the config to the format that guppy table expects
  return config.map((column: SummaryTableColumn) => {
    return {
      header: column.title ?? fieldNameToTitle(column.field),
      accessorKey: column.field,
    };
  });
};

export const jsonPathAccessor =
  <T extends Record<string, any>>(path: string) =>
  (row: MRT_Row<T>) => {
    // TODO: add logging if path is not found
    return JSONPath({ json: row, path: path });
  };
