import {  MRT_Row } from 'mantine-react-table';
import React, { ReactElement } from 'react';
import { Box, Text } from '@mantine/core';

interface RowRenderFunctionProps {
  row: MRT_Row;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultRowRenderer =  ( row: RowRenderFunctionProps): ReactElement => {
  return (
    <Box
      sx={{
        display: 'grid',
        margin: 'auto',
        gridTemplateColumns: '1fr 1fr',
        width: '100%',
      }}
    >
    </Box>
  );
};

// TODO Tighten up the typing here
export type RowRendererFunction = (
  props: RowRenderFunctionProps,
  ...args: any[]
) => ReactElement;

export interface RowRendererFunctionCatalogEntry {
  [key: string]: RowRendererFunction;
}

export class DiscoveryRowRendererFactory {
  private static instance: DiscoveryRowRendererFactory;
  private RowRendererCatalog: Record<
    string,
    RowRendererFunctionCatalogEntry
  > = {};

  private constructor() {
    this.RowRendererCatalog = {};
  }

  static getInstance(): DiscoveryRowRendererFactory {
    console.log('getInstance');
    if (!DiscoveryRowRendererFactory.instance) {
      DiscoveryRowRendererFactory.instance = new DiscoveryRowRendererFactory();
    }
    return DiscoveryRowRendererFactory.instance;
  }

  static getRowRenderer(type: string, functionName: string): RowRendererFunction {
    return DiscoveryRowRendererFactory.getInstance().RowRendererCatalog[type][functionName] ?? defaultRowRenderer;
  }

  static registerRowRenderer( type: string, functionName: string, func: RowRendererFunction): void {
    if (DiscoveryRowRendererFactory.getInstance().RowRendererCatalog[type] === undefined) {
      DiscoveryRowRendererFactory.getInstance().RowRendererCatalog[type] = {};
    }
    DiscoveryRowRendererFactory.getInstance().RowRendererCatalog[type][functionName] = func;
  }

  static registerRowRendererCatalog(catalog: Record<
    string,
    RowRendererFunctionCatalogEntry
  >): void {
    Object.keys(catalog).map((type) => {
      Object.entries(catalog[type]).map(([name, func]) => {
        DiscoveryRowRendererFactory.registerRowRenderer(type, name, func);
      });
    });
  }
}

/**
 * Retrieve the Row renderer function for the given type and function name
 * @param type
 * @param functionName
 * @param params
 */
export const DiscoveryTableRowRenderer = (
  type?: string,
  functionName = 'default',
  ...params: any[]
): RowRendererFunction => {

  if (!type) {
    return defaultRowRenderer;
  }
  const func = DiscoveryRowRendererFactory.getRowRenderer(
    type,
    functionName,
  );
  return (Row): ReactElement => func(Row, ...params);
};
