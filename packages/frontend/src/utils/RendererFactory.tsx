import { ReactElement } from 'react';

export type RendererFunction<T> = (props: T, ...params:any[]) => ReactElement;

export interface RendererFunctionCatalogEntry<T> {
  [key: string]: RendererFunction<T>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DefaultCellRenderer<T>(_props: T): ReactElement {
  return <span>DefaultRenderer</span>;
}

interface RendererFactoryInterface<T> {
  getRenderer(type: string, functionName: string): RendererFunction<T>;
  registerRenderer(
    type: string,
    functionName: string,
    func: RendererFunction<T>,
  ): void;
  registerCellRendererCatalog(
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
    this.defaultRenderer = DefaultCellRenderer;
  }

  setDefaultRenderer(func: RendererFunction<T>): void {
    this.defaultRenderer = func;
  }

  getRenderer(type: string, functionName: string): RendererFunction<T> {
      if (!this.rendererExists(type, functionName)) {
          return DefaultCellRenderer;
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

  registerCellRendererCatalog(
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
