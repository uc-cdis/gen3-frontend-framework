import { ReactNode, RefObject } from 'react';
import {
  MRT_Cell,
  MRT_Column,
  MRT_Row,
  MRT_TableInstance
} from 'mantine-react-table';
import { JSONObject } from '@gen3/core';

export type RendererFunction<T> = (props: T, ...params: any[]) => ReactNode;

export type RenderFunction2 = (props: {
  cell: MRT_Cell<JSONObject>;
  renderedCellValue: ReactNode;
  column: MRT_Column<JSONObject>;
  row: MRT_Row<JSONObject>;
  rowRef?: RefObject<HTMLTableRowElement> | undefined;
  table: MRT_TableInstance<JSONObject>;
}) => ReactNode;

export interface RendererFunctionCatalogEntry<T> {
  [key: string]: RendererFunction<T>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DefaultItemRenderer<T>(_props: T): ReactNode {
  return <span>DefaultRenderer</span>;
}

interface RendererFactoryInterface<T> {
  getRenderer(type: string, functionName: string): RendererFunction<T>;
  registerRenderer(
    type: string,
    functionName: string,
    func: RendererFunction<T>,
  ): void;
  registerRendererCatalog(
    catalog: Record<string, RendererFunctionCatalogEntry<T>>,
  ): void;
}

export class RenderFactoryTypedInstance<T>
  implements RendererFactoryInterface<T>
{
  private catalog: Record<string, RendererFunctionCatalogEntry<T>>;
  private defaultRenderer: RendererFunction<T>;

  constructor() {
    this.catalog = {};
    this.defaultRenderer = DefaultItemRenderer;
  }

  /**
   * Sets the default renderer function for the specified type.
   *
   * @param {RendererFunction<T>} func - The renderer function to set as the default.
   * @return {void}
   */
  setDefaultRenderer(func: RendererFunction<T>): void {
    this.defaultRenderer = func;
  }

  getRenderer(type: string, functionName: string): RendererFunction<T> {
    if (!this.rendererExists(type, functionName)) {
      return DefaultItemRenderer;
    }

    return this.catalog[type][functionName];
  }

  /**
   * Check if a renderer exists for a given type and function name
   * @param type
   * @param functionName
   * @returns boolean indicating if the renderer exists
   */
  rendererExists(type: string, functionName: string): boolean {
    return type in this.catalog && functionName in this.catalog[type];
  }

  /**
   * Registers a renderer function for a given type and function name.
   *
   * @param {string} type - The type of the renderer function.
   * @param {string} functionName - The name of the renderer function.
   * @param {RendererFunction<T>} func - The renderer function to register.
   * @returns {boolean} - True if the registration is successful, false otherwise.
   * @throws {Error} - If any of the input parameters are missing or if the renderer function already exists.
   */
  registerRenderer(
    type: string,
    functionName: string,
    func: RendererFunction<T>,
  ): boolean {
    if (type && functionName && func) {
      try {
        if (!this.catalog[type]) {
          this.catalog[type] = {};
        }
        if (!this.catalog[type][functionName]) {
          this.catalog[type][functionName] = func;
        } else {
          throw new Error(
            `Renderer function ${functionName} already exists for type ${type}`,
          );
        }
        return true;
      } catch (error) {
        console.error(
          `Error registering renderer ${functionName} for type ${type}: ${error}`,
        );
        return false;
      }
    } else {
      throw new Error('Invalid input parameters');
    }
  }

  /**
   * Registers a renderer catalog.
   *
   * @param {Record<string, RendererFunctionCatalogEntry<T>>} catalog - The catalog object containing the renderers.
   * @returns {boolean} - True if the catalog was registered successfully, otherwise false.
   */
  registerRendererCatalog(
    catalog: Record<string, RendererFunctionCatalogEntry<T>>,
  ): boolean {
    if (catalog) {
      Object.keys(catalog).forEach((type) => {
        if (catalog[type]) {
          Object.entries(catalog[type]).forEach(([name, func]) => {
            if (typeof func === 'function') {
              try {
                this.registerRenderer(type, name, func);
              } catch (error) {
                new Error(
                  `Error registering renderer ${name} for type ${type}: ${error}`,
                );
                return false;
              }
            }
          });
        }
      });
      return true;
    }
    return false;
  }
}

/**
 * Represents the props required for a cell renderer function.
 */
export interface CellRendererFunctionProps<
  T extends Record<string, any> = JSONObject,
> {
  cell: MRT_Cell<T>;
  renderedCellValue: ReactNode;
  column: MRT_Column<T>;
  row: MRT_Row<T>;
  rowRef?: RefObject<HTMLTableRowElement> | undefined;
  table: MRT_TableInstance<T>;
}
