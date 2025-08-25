import { RowActionFunction } from './types';

export interface RowActionCreatorFactoryItem {
  readonly action: RowActionFunction;
  params?: Record<string, unknown>;
}

const registeredRowActions: Record<string, RowActionCreatorFactoryItem> = {};

export const NullRowAction: RowActionFunction = async () => {
  // intentionally no-op
};

export const registerRowAction = (
  actionName: string,
  action: RowActionCreatorFactoryItem,
): void => {
  registeredRowActions[actionName] = action;
};

export const findRowAction = (
  actionName: string,
): RowActionCreatorFactoryItem | undefined => {
  if (!(actionName in registeredRowActions)) {
    console.error('RowActions: findRowAction: no action found for', actionName);
    return undefined;
  }
  return registeredRowActions[actionName];
};
