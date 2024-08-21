import React, { ReactElement } from 'react';
import { JSONObject } from '@gen3/core';

export interface DataItemRenderFunctionProps<V = any, T = JSONObject> {
  value: V; // value of the cell
  params?: T;
}

/**
 * A Data Item Renderer Function is a function that takes a value and returns a ReactElement
 * This is used to create a custom cell render a cell in the Discovery Table. The Discovery config
 * is available from the DiscoveryContext.
 * @param props: value and optional cell object
 */
export type DataItemRendererFunction<V = any, T = JSONObject> = (
  props: DataItemRenderFunctionProps<V, T>,
) => ReactElement;
