import { JSONObject } from '@gen3/core';
import { ReactElement } from 'react';
import { MRT_Cell, MRT_RowData } from 'mantine-react-table';

// TODO Tighten up the typing
export interface CellRenderFunctionProps<
  T = any,
  C extends MRT_RowData = JSONObject,
> {
  value: T; // value of the cell
  cell?: MRT_Cell<C>; // optional cell object for use in custom cell renderers
}

/**
 * A Cell Renderer Function is a function that takes a value and returns a ReactElement
 * This is used to create a custom cell render a cell in the Discovery Table. The Discovery config
 * is available from the DiscoveryContext.
 * @param props: value and optional cell object
 */
export type CellRendererFunction<T = JSONObject> = (
  props: CellRenderFunctionProps,
  params?: T,
) => ReactElement;
