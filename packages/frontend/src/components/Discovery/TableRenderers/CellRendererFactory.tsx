import {  MRT_Cell } from 'mantine-react-table';
import React, { ReactElement } from 'react';
import { Text } from '@mantine/core';

interface CellRenderFunctionProps {
  cell: MRT_Cell;
}

const defaultCellRenderer =  ( {cell} : CellRenderFunctionProps): ReactElement => {
  const value = cell.getValue() as never;
  return (<Text>{value}</Text>);
};

// TODO Tighten up the typing here
export type CellRendererFunction = (
  props: CellRenderFunctionProps,
  ...args: any[]
) => ReactElement;

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
    console.log('getInstance');
    if (!DiscoveryCellRendererFactory.instance) {
      DiscoveryCellRendererFactory.instance = new DiscoveryCellRendererFactory();
    }
    return DiscoveryCellRendererFactory.instance;
  }

  static getCellRenderer(type: string, functionName: string): CellRendererFunction {
    return DiscoveryCellRendererFactory.getInstance().cellRendererCatalog[type][functionName] ?? defaultCellRenderer;
  }

  static registerCellRenderer( type: string, functionName: string, func: CellRendererFunction): void {
    if (DiscoveryCellRendererFactory.getInstance().cellRendererCatalog[type] === undefined) {
      DiscoveryCellRendererFactory.getInstance().cellRendererCatalog[type] = {};
    }
    DiscoveryCellRendererFactory.getInstance().cellRendererCatalog[type][functionName] = func;
  }

  static registerCellRendererCatalog(catalog: Record<
    string,
    CellRendererFunctionCatalogEntry
  >): void {
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
  type?: string,
  functionName = 'default',
  ...params: any[]
): CellRendererFunction => {

  if (!type) {
    return defaultCellRenderer;
  }
  const func = DiscoveryCellRendererFactory.getCellRenderer(
    type,
    functionName,
  );
  return (cell): ReactElement => func(cell, ...params);
};
