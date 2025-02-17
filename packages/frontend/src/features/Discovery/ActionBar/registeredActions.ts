import { DataActionFunction, DataActionFunctionProps } from './types';
/*
// create a factory for the action creators

export interface ActionCreatorFactoryItem {
  readonly action: DataActionFunction;
}

const registeredDataLibraryActions: Record<string, ActionCreatorFactoryItem> =
  {};

export const NullAction: DataActionFunction = (): Promise<void> => {
  return new Promise<void>((done) => {
    if (done) done();
  });
};

export const registerAction = (
  actionName: string,
  action: ActionCreatorFactoryItem,
) => {
  registeredDataLibraryActions[actionName] = action;
};

export const findAction = (
  actionName?: string,
): ActionCreatorFactoryItem | undefined => {
  if (actionName === undefined) {
    console.error('DataLibrary: findAction: no name provided');
    return undefined;
  }

  if (!(actionName in registeredDataLibraryActions)) {
    console.error('getButtonAction: no action found for', actionName);
    return undefined;
  }
  return registeredDataLibraryActions[actionName];
};

export const registerDefaultDataLibraryActions = () => {};

registerDefaultDataLibraryActions();
 */

export const AddSelectionToDataLibrary: DataActionFunction = ({
  selectedResources,
}: DataActionFunctionProps) => {
  return new Promise<void>((done) => {
    if (done) done();
  });
};
