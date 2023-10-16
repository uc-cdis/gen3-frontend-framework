import { JSONObject } from '@gen3/core';
import { ReactElement } from 'react';
import { MRT_Cell } from 'mantine-react-table';

// TODO Tighten up the typing
export interface CellRenderFunctionProps<T = any> {
  value: T; // value of the cell
  cell?: MRT_Cell; // optional cell object for use in custom cell renderers
}

/**
 * A Cell Renderer Function is a function that takes a value and returns a ReactElement
 * This is used to create a custom cell render a cell in the Discovery Table. The Discovery config
 * is available from the DiscoveryContext.
 * @param props: value and optional cell object
 */
export type CellRendererFunction = (
  props: CellRenderFunctionProps,
  params?: JSONObject,
) => ReactElement;
