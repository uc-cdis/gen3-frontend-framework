import { ReactElement } from 'react';
import {
  type RowRenderFunctionParams,
  defaultRowRenderer,
  Gen3DiscoveryStandardRowPreviewRenderers,
} from './RowRenderers';
import { StudyDetailsField } from '../types';

// TODO Tighten up the typing here
export type RowRendererFunction = (
  props: RowRenderFunctionParams,
  studyPreviewConfig?: StudyDetailsField,
) => ReactElement;

export interface RowRendererFunctionCatalogEntry {
  [key: string]: RowRendererFunction;
}

export class DiscoveryRowRendererFactory {
  private static instance: DiscoveryRowRendererFactory;
  private RowRendererCatalog: Record<string, RowRendererFunctionCatalogEntry> =
    {};

  private constructor() {
    this.RowRendererCatalog = {};
  }

  static getInstance(): DiscoveryRowRendererFactory {
    if (!DiscoveryRowRendererFactory.instance) {
      DiscoveryRowRendererFactory.instance = new DiscoveryRowRendererFactory();
    }
    return DiscoveryRowRendererFactory.instance;
  }

  static getRowRenderer(
    type: string,
    functionName: string,
  ): RowRendererFunction {
    if (!(type in DiscoveryRowRendererFactory.getInstance().RowRendererCatalog)) {
      console.log('No row renderer found for type: ', type);
      return defaultRowRenderer;
    }

    return (
      DiscoveryRowRendererFactory.getInstance().RowRendererCatalog[type][
        functionName
      ] ?? defaultRowRenderer
    );
  }

  static registerRowRenderer(
    type: string,
    functionName: string,
    func: RowRendererFunction,
  ): void {
    if (
      DiscoveryRowRendererFactory.getInstance().RowRendererCatalog[type] ===
      undefined
    ) {
      DiscoveryRowRendererFactory.getInstance().RowRendererCatalog[type] = {};
    }
    DiscoveryRowRendererFactory.getInstance().RowRendererCatalog[type][
      functionName
    ] = func;
  }

  static registerRowRendererCatalog(
    catalog: Record<string, RowRendererFunctionCatalogEntry>,
  ): void {
    Object.keys(catalog).map((type) => {
      Object.entries(catalog[type]).map(([name, func]) => {
        DiscoveryRowRendererFactory.registerRowRenderer(type, name, func);
      });
    });
  }
}

/**
 * Retrieve the Row renderer function for the given type and function name
 * @param studyPreviewConfig
 */
export const DiscoveryTableRowRenderer = (
  studyPreviewConfig?: StudyDetailsField,
): RowRendererFunction => {
  if (!studyPreviewConfig?.contentType) {
    return (row): ReactElement => defaultRowRenderer(row, studyPreviewConfig);
  }
  const func = DiscoveryRowRendererFactory.getRowRenderer(
    studyPreviewConfig?.contentType,
    studyPreviewConfig?.renderer ?? 'default',
  );
  if (!func) {
    throw new Error(`No row renderer found for given config (contentType: ${ studyPreviewConfig?.contentType }, detailRenderer: ${ studyPreviewConfig?.renderer ?? 'default'}`);
  }
  return (row): ReactElement => func(row, studyPreviewConfig);
};

export const registerDiscoveryDefaultStudyPreviewRenderers = () => {
  DiscoveryRowRendererFactory.registerRowRendererCatalog(
    Gen3DiscoveryStandardRowPreviewRenderers,
  );
};
