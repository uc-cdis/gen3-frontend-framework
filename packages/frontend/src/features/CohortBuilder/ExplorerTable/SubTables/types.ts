import { JSONObject } from '@gen3/core';
import { ExplorerTableColumnMRT, FieldSubtable } from '../types';

export interface ExpandingSubTableProps {
  config: FieldSubtable;
  data?: JSONObject[];
}

export interface ExplorerTableSubTableProps {
  columns: ExplorerTableColumnMRT[];
  data?: JSONObject[];
}
