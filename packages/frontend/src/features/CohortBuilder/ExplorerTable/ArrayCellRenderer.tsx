import React from 'react';
import { isArray } from 'lodash';
import { JSONObject } from '@gen3/core';
import { CellRendererFunction, CellRendererFunctionProps } from './types';

export const ArrayCellRenderer = (
  cellRenderFunction: CellRendererFunction,
  props: CellRendererFunctionProps<JSONObject>,
  ...args: any[]
) => {
  const { cell } = props;
  const value = cell.getValue();
  if (isArray(value)) {
    return (
      <div className="w-64 flex flex-wrap gap-0.5">
        {value.map((x) => cellRenderFunction({ ...props, cell: x }, args))}
      </div>
    );
  } else {
    return cellRenderFunction(props, args);
  }
};
