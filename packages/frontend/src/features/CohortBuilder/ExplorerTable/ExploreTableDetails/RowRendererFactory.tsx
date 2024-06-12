import { ReactElement } from 'react';
import {
  type RowRenderFunctionParams,
  defaultRowRenderer,
  Gen3DiscoveryStandardRowPreviewRenderers,
} from './RowRenderers';
import { ExplorerDetailsConfig } from './types';

// TODO Tighten up the typing here
export type RowRendererFunction = (
  props: RowRenderFunctionParams,
  config?: ExplorerDetailsConfig,
) => ReactElement;

export interface RowRendererFunctionCatalogEntry {
  [key: string]: RowRendererFunction;
}

export class RowRendererFactory {
  private static instance: RowRendererFactory;
  private RowRendererCatalog: Record<string, RowRendererFunctionCatalogEntry> =
    {};

  private constructor() {
    this.RowRendererCatalog = {};
  }

  static getInstance(): RowRendererFactory {
    if (!RowRendererFactory.instance) {
      RowRendererFactory.instance = new RowRendererFactory();
    }
    return RowRendererFactory.instance;
  }

  static getRowRenderer(
    type: string,
    functionName: string,
  ): RowRendererFunction {
    if (!(type in RowRendererFactory.getInstance().RowRendererCatalog)) {
      console.log('No row renderer found for type: ', type);
      return defaultRowRenderer;
    }

    return (
      RowRendererFactory.getInstance().RowRendererCatalog[type][functionName] ??
      defaultRowRenderer
    );
  }

  static registerRowRenderer(
    type: string,
    functionName: string,
    func: RowRendererFunction,
  ): void {
    if (
      RowRendererFactory.getInstance().RowRendererCatalog[type] === undefined
    ) {
      RowRendererFactory.getInstance().RowRendererCatalog[type] = {};
    }
    RowRendererFactory.getInstance().RowRendererCatalog[type][functionName] =
      func;
  }

  static registerRowRendererCatalog(
    catalog: Record<string, RowRendererFunctionCatalogEntry>,
  ): void {
    Object.keys(catalog).map((type) => {
      Object.entries(catalog[type]).map(([name, func]) => {
        RowRendererFactory.registerRowRenderer(type, name, func);
      });
    });
  }
}

/**
 * Retrieve the Row renderer function for the given type and function name
 * @param config
 */
export const CohortBuilderTableRowRenderer = (
  config?: ExplorerDetailsConfig,
): RowRendererFunction => {
  if (!config?.renderer) {
    return (row): ReactElement => defaultRowRenderer(row, config);
  }
  const func = RowRendererFactory.getRowRenderer(
    config?.renderer,
    config?.renderer ?? 'default',
  );
  if (!func) {
    throw new Error(
      `No row renderer found for given config (contentType: ${
        config?.renderer
      }, detailRenderer: ${config?.renderer ?? 'default'}`,
    );
  }
  return (row): ReactElement => func(row, config);
};

export const registerCohortBuilderDefaultPreviewRenderers = () => {
  RowRendererFactory.registerRowRendererCatalog(
    Gen3DiscoveryStandardRowPreviewRenderers,
  );
};
