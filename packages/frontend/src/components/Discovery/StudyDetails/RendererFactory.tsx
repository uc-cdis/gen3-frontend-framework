import React, { ReactElement } from 'react';
import { DiscoveryResource, StudyTabTagField } from '../types';

export type FieldRendererFunction = (
  _1?: string | StudyTabTagField,
  _2?: string | string[] | DiscoveryResource,
) => JSX.Element;

const defaultStudyFieldRenderer = (): ReactElement => {
  return <span>Field</span>;
};

export type FieldRendererFunctionMap = Record<string, FieldRendererFunction>;

export class StudyFieldRendererFactory {
  private static instance: StudyFieldRendererFactory;
  private fieldRendererCatalog: Record<string, FieldRendererFunctionMap> = {};

  private constructor() {
    this.fieldRendererCatalog = {};
  }

  static getInstance(): StudyFieldRendererFactory {
    if (!StudyFieldRendererFactory.instance) {
      StudyFieldRendererFactory.instance = new StudyFieldRendererFactory();
    }
    return StudyFieldRendererFactory.instance;
  }

  static getRenderer(
    type: string,
    functionName: string,
  ): FieldRendererFunction {
    return (
      StudyFieldRendererFactory.getInstance().fieldRendererCatalog[type][
        functionName
      ] ?? defaultStudyFieldRenderer
    );
  }

  static registerFieldRenderer(
    type: string,
    functionName: string,
    func: FieldRendererFunction,
  ): void {
    if (
      StudyFieldRendererFactory.getInstance().fieldRendererCatalog[type] ===
      undefined
    ) {
      StudyFieldRendererFactory.getInstance().fieldRendererCatalog[type] = {};
    }
    StudyFieldRendererFactory.getInstance().fieldRendererCatalog[type][
      functionName
    ] = func;
  }

  static registerFieldRendererCatalog(
    catalog: Record<string, FieldRendererFunctionMap>,
  ): void {
    Object.keys(catalog).map((type) => {
      Object.entries(catalog[type]).map(([name, func]) => {
        StudyFieldRendererFactory.registerFieldRenderer(type, name, func);
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
export const DiscoveryDetailsRenderer = (
  type = 'string',
  functionName = 'default',
): FieldRendererFunction => {
  if (!type) {
    return defaultStudyFieldRenderer;
  }
  const func = StudyFieldRendererFactory.getRenderer(type, functionName);
  return (arg1, arg2): ReactElement => func(arg1, arg2);
};
