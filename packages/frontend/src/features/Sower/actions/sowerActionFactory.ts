import type { JobBuilderAction, JobOutputAction } from '@gen3/core';

class ActionRegistry<T> {
  private actions = new Map<string, T>();

  register(name: string, action: T): void {
    if (this.actions.has(name)) {
      console.warn(
        `ActionRegistry: overwriting already-registered action "${name}"`,
      );
    }
    this.actions.set(name, action);
  }

  getAction(name: string): T | null {
    const action = this.actions.get(name);
    if (!action) return null;
    return action;
  }

  hasAction(name: string): boolean {
    return this.actions.has(name);
  }
}

export const sowerJobBuilderRegistry = new ActionRegistry<JobBuilderAction>();
export const sowerOutputActionRegistry = new ActionRegistry<JobOutputAction>();

export const findCreateJobAction = (name: string) =>
  sowerJobBuilderRegistry.getAction(name);
export const findSendResultsAction = (name: string) =>
  sowerOutputActionRegistry.getAction(name);
