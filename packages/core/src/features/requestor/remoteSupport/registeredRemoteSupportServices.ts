import { RemoteSupportRequestAction } from './types';
import { defaultLogger, Logger } from '../../../utils/logger';

const DefaultRemoteSupportAction: RemoteSupportRequestAction = async () => {
  throw new Error('No remote support service registered for this service name');
};

export class RemoteSupportServiceRegistry {
  private services = new Map<string, RemoteSupportRequestAction>();
  private logger: Logger;

  constructor(logger: Logger = defaultLogger) {
    this.logger = logger;
  }

  /**
   * Register a remote support service
   * @param serviceName - Unique identifier for the service
   * @param action - The action function to execute for this service
   * @throws Error if serviceName or action is invalid
   */
  public registerService(
    serviceName: string,
    action: RemoteSupportRequestAction,
  ): void {
    if (!serviceName?.trim()) {
      throw new Error('Service name cannot be empty or null');
    }

    if (typeof action !== 'function') {
      throw new Error('Action must be a function');
    }

    if (this.services.has(serviceName)) {
      this.logger.warn(
        `Service '${serviceName}' is already registered and will be overwritten.`,
      );
    }

    this.services.set(serviceName, action);
  }

  /**
   * Get a registered service action
   * @param serviceName - The service identifier
   * @returns The registered action or default action if not found
   */
  public getSupportService(serviceName: string): RemoteSupportRequestAction {
    if (!serviceName?.trim()) {
      this.logger.error('Service name cannot be empty or null');
      return DefaultRemoteSupportAction;
    }

    const service = this.services.get(serviceName);

    if (!service) {
      this.logger.warn(
        `Service '${serviceName}' not registered. Using default action.`,
      );
      return DefaultRemoteSupportAction;
    }

    return service;
  }

  /**
   * Check if a service is registered
   * @param serviceName - The service identifier
   * @returns true if service is registered
   */
  public hasService(serviceName: string): boolean {
    return this.services.has(serviceName);
  }

  /**
   * Get all registered service names
   * @returns Array of registered service names
   */
  public getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Unregister a service
   * @param serviceName - The service identifier
   * @returns true if service was removed, false if it wasn't registered
   */
  public unregisterService(serviceName: string): boolean {
    return this.services.delete(serviceName);
  }

  /**
   * Clear all registered services
   */
  public clear(): void {
    this.services.clear();
  }

  /**
   * Get the number of registered services
   */
  public size(): number {
    return this.services.size;
  }
}

let defaultRegistryInstance: RemoteSupportServiceRegistry | null = null;

export function getDefaultRegistry(
  logger?: Logger,
): RemoteSupportServiceRegistry {
  if (!defaultRegistryInstance) {
    defaultRegistryInstance = new RemoteSupportServiceRegistry(logger);
  }
  return defaultRegistryInstance;
}

export function resetDefaultRegistry(): void {
  defaultRegistryInstance = null;
}
