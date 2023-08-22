import React, { ReactElement } from 'react';
import { Text } from '@mantine/core';
import { JSONObject } from '@gen3/core';
import { CellRendererFunction, CellRenderFunctionProps } from './types';

const defaultCellRenderer = ({
  value,
}: CellRenderFunctionProps): ReactElement => {
  return <Text>{value}</Text>;
};

export interface CellRendererFunctionCatalogEntry {
  [key: string]: CellRendererFunction;
}

export class DiscoveryCellRendererFactory {
  private static instance: DiscoveryCellRendererFactory;
  private cellRendererCatalog: Record<
    string,
    CellRendererFunctionCatalogEntry
  > = {};

  private constructor() {
    this.cellRendererCatalog = {};
  }

  static getInstance(): DiscoveryCellRendererFactory {
    if (!DiscoveryCellRendererFactory.instance) {
      DiscoveryCellRendererFactory.instance =
        new DiscoveryCellRendererFactory();
    }
    return DiscoveryCellRendererFactory.instance;
  }

  static getCellRenderer(
    type: string,
    functionName: string,
  ): CellRendererFunction {
    return (
      DiscoveryCellRendererFactory.getInstance().cellRendererCatalog[type][
        functionName
      ] ?? defaultCellRenderer
    );
  }

  static registerCellRenderer(
    type: string,
    functionName: string,
    func: CellRendererFunction,
  ): void {
    if (
      DiscoveryCellRendererFactory.getInstance().cellRendererCatalog[type] ===
      undefined
    ) {
      DiscoveryCellRendererFactory.getInstance().cellRendererCatalog[type] = {};
    }
    DiscoveryCellRendererFactory.getInstance().cellRendererCatalog[type][
      functionName
    ] = func;
  }

  static registerCellRendererCatalog(
    catalog: Record<string, CellRendererFunctionCatalogEntry>,
  ): void {
    Object.keys(catalog).map((type) => {
      Object.entries(catalog[type]).map(([name, func]) => {
        DiscoveryCellRendererFactory.registerCellRenderer(type, name, func);
      });
    });
  }
}

/**
 * Retrieve the cell renderer function for the given type and function name
 * @param type
 * @param functionName
 * @param params
 */
export const DiscoveryTableCellRenderer = (
  type = 'string',
  functionName = 'default',
  params: JSONObject = {},
): CellRendererFunction => {
  if (!type) {
    return defaultCellRenderer;
  }
  const func = DiscoveryCellRendererFactory.getCellRenderer(type, functionName);
  return (cellProps): ReactElement => func(cellProps, params);
};
