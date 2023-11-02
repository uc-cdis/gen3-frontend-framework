import { MRT_Cell } from 'mantine-react-table';
import React, { ReactElement } from 'react';
import { Text } from '@mantine/core';

interface CellRenderFunctionProps {
  cell: MRT_Cell;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultCellRenderer = (_: CellRenderFunctionProps): ReactElement => (
  <Text>value</Text>
);

// TODO Tighten up the typing here
export type CellRendererFunction = (
  props: CellRenderFunctionProps,
  ...args: any[]
) => ReactElement;

export interface CellRendererFunctionCatalogEntry {
  [key: string]: CellRendererFunction;
}

export class TableCellRendererFactory<T = CellRendererFunctionCatalogEntry> {
  private static instance: TableCellRendererFactory;
  private cellRendererCatalog: Record<string, T> = {};

  private constructor() {
    this.cellRendererCatalog = {};
  }

  static getInstance(): TableCellRendererFactory {
    if (!TableCellRendererFactory.instance) {
      TableCellRendererFactory.instance = new TableCellRendererFactory();
    }

    return TableCellRendererFactory.instance;
  }

  static getCellRenderer(
    type: string,
    functionName: string,
  ): CellRendererFunction {
    return (
      TableCellRendererFactory.getInstance().cellRendererCatalog[type][
        functionName
      ] ?? defaultCellRenderer
    );
  }

  static registerCellRenderer(
    type: string,
    functionName: string,
    func: CellRendererFunction,
  ): void {
    TableCellRendererFactory.getInstance().cellRendererCatalog[type][
      functionName
    ] = func;
  }

  static registerCellRendererCatalog(
    catalog: Record<string, CellRendererFunctionCatalogEntry>,
  ): void {
    Object.keys(catalog).map((type) => {
      Object.entries(catalog[type]).map(([name, func]) => {
        TableCellRendererFactory.registerCellRenderer(type, name, func);
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
export const TableCellRenderer = (
  type?: string,
  functionName = 'default',
  ...params: any[]
): CellRendererFunction => {
  if (!type) {
    return defaultCellRenderer;
  }
  const func = TableCellRendererFactory.getCellRenderer(type, functionName);
  return (cell): ReactElement => func(cell, ...params);
};
