import { ReactElement } from 'react';

export type RendererFunction<T> = (props: T) => ReactElement;

export interface RendererFunctionCatalogEntry<T> {
  [key: string]: RendererFunction<T>;
}

export function DefaultCellRenderer<T>(_props: T): ReactElement {
  return <div></div>;
}

interface RendererFactorInterface<T> {
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
implements RendererFactorInterface<T>
{
  private catalog: Record<string, RendererFunctionCatalogEntry<T>>;

  constructor() {
    this.catalog = {};
  }

  getRenderer(type: string, functionName: string): RendererFunction<T> {
    if (!this.catalog[type] || !this.catalog[type][functionName]) {
      return DefaultCellRenderer;
    }

    return this.catalog[type][functionName];
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
