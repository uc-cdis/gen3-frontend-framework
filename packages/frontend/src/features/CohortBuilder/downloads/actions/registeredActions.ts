import { ActionButtonWithArgsFunction, ActionButtonFunction } from '../../types';
import { downloadToFileAction } from './downloadToFile';
// create a factory for the action creators

interface ActionCreatorFactoryItem {
  readonly action: ActionButtonWithArgsFunction;
  readonly args: Record<string, any>;
}

const registeredButtonActions: Record<string, ActionCreatorFactoryItem> = {};

export const NullButtonAction:ActionButtonWithArgsFunction = (): Promise<void>  => { return new Promise<void>(()=>null); };

export const registerButtonAction = (
  buttonName: string,
  actionItem: ActionCreatorFactoryItem,
) => {
  registeredButtonActions[buttonName] = actionItem;
};

export const findButtonAction = (buttonName?: string): ActionCreatorFactoryItem | undefined => {
  if (buttonName === undefined) {
    console.error('getButtonAction: no name provided');
    return undefined;
  }

  if (!(buttonName in registeredButtonActions)) {
    console.error('getButtonAction: no action found for', buttonName);
    return undefined;
  }
  return registeredButtonActions[buttonName];
};


export const registerDefaultButtonActions = () => {
  registerButtonAction('data-json', {
    action: downloadToFileAction, args: { format: 'json' }
  });
  registerButtonAction('data-csv', {
    action: downloadToFileAction, args: { format: 'csv' }
  });
  registerButtonAction('data-tsv', {
    action: downloadToFileAction, args: { format: 'tsv' }
  });
};

registerDefaultButtonActions();
