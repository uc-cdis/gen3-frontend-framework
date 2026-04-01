import { ActionButtonWithArgsFunction } from '../../types';
import { downloadToFileAction } from './downloadToFile';
import { downloadToManifestAction } from './downloadManifest';
import { addCohortDataFilesToDataLibraryAsDataset, exportCohortToWorkspace, } from './addCohortToDataLibrary';

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

export const registerDownloadButtonAction = (
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
  registerDownloadButtonAction('data-json', {
    action: downloadToFileAction,
    args: { format: 'json' },
  });
  registerDownloadButtonAction('data-csv', {
    action: downloadToFileAction,
    args: { format: 'csv' },
  });
  registerDownloadButtonAction('data-tsv', {
    action: downloadToFileAction,
    args: { format: 'tsv' },
  });
  registerDownloadButtonAction('manifest', {
    action: downloadToManifestAction,
    args: { format: 'manifest' },
  });
  registerDownloadButtonAction('cohortDataFilesToDataLibrary', {
    action: addCohortDataFilesToDataLibraryAsDataset,
    args: { format: 'json' },
  });
  registerDownloadButtonAction('exportCohortToWorkspace', {
    action: exportCohortToWorkspace,
    args: { format: 'json' },
  });
};

registerDefaultButtonActions();
