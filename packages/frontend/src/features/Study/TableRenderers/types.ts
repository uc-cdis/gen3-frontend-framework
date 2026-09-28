import { JSONObject } from '@gen3/core';
import { ReactElement } from 'react';
import { MRT_Cell, MRT_Row, MRT_RowData } from 'mantine-react-table-open';

// TODO Tighten up the typing
export interface CellRenderFunctionProps<
  T = any,
  C extends MRT_RowData = JSONObject,
> {
  value: T; // value of the cell
  cell?: MRT_Cell<C>; // optional cell object for use in custom cell renderers
  row?: MRT_Row<C>; // optional row cell object
}

/**
 * A Cell Renderer Function is a function that takes a value and returns a ReactElement
 * @param props: value and optional cell object
 */
export type CellRendererFunction<T = JSONObject> = (
  props: CellRenderFunctionProps,
  params?: T,
) => ReactElement;
