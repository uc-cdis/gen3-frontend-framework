import {
  ActionButtonWithArgsFunction,
  ActionButtonFunction,
} from '../../types';
import { downloadToFileAction } from './downloadToFile';
import { downloadToManifestAction } from './downloadManifest';
import { submitJobAction } from './sowerActions';

// create a factory for the action creators

interface ActionCreatorFactoryItem {
  readonly action: ActionButtonWithArgsFunction;
  readonly args: Record<string, any>;
}

const registeredButtonActions: Record<string, ActionCreatorFactoryItem> = {};

export const NullButtonAction: ActionButtonWithArgsFunction = (
  _params,
  done,
): Promise<void> => {
  return new Promise<void>((done) => {
    if (done) done();
  });
};

export const registerButtonAction = (
  buttonName: string,
  actionItem: ActionCreatorFactoryItem,
) => {
  registeredButtonActions[buttonName] = actionItem;
};

export const findButtonAction = (
  buttonName?: string,
): ActionCreatorFactoryItem | undefined => {
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
    action: downloadToFileAction,
    args: { format: 'json' },
  });
  registerButtonAction('data-csv', {
    action: downloadToFileAction,
    args: { format: 'csv' },
  });
  registerButtonAction('data-tsv', {
    action: downloadToFileAction,
    args: { format: 'tsv' },
  });
  registerButtonAction('manifest', {
    action: downloadToManifestAction,
    args: { format: 'manifest' },
  });
  registerButtonAction('export-pfb-to-url', {
    action: submitJobAction,
    args: { action: 'export-files' },
  });
};

registerDefaultButtonActions();
