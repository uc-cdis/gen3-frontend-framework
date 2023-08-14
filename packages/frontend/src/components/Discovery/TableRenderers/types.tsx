import { JSONObject } from '@gen3/core';
import { ReactElement } from 'react';
import { MRT_Cell } from 'mantine-react-table';

export interface CellRenderFunctionProps {
  cell: MRT_Cell;
}

// TODO Tighten up the typing here
export type CellRendererFunction = (
  props: CellRenderFunctionProps,
  params?: JSONObject,
) => ReactElement;
