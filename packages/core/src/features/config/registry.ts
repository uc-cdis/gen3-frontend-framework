export type RegistryTypes = string | number | boolean;

class ConfigRegistry<T = Record<string, RegistryTypes>> {
  private config: T | null = null;

  init(config: T): void {
    if (this.config !== null) {
      console.warn('Gen3ConfigRegistry already initialized');
      return;
    }

    this.config = Object.freeze({ ...config });
  }

  get<K extends keyof T>(key: K): T[K] {
    if (!this.config) {
      throw new Error('ConfigRegistry not initialized');
    }
    return this.config[key];
  }

  getAll(): Readonly<T> {
    if (!this.config) {
      throw new Error('ConfigRegistry not initialized');
    }
    return this.config;
  }
}

export const configRegistry = new ConfigRegistry();
