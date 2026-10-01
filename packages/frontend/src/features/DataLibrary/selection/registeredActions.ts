import { sendExistingPFBToURL } from './exportActions';
import { exportToManifest } from './actions/exportToManifest';
import type { DataActionFunction } from './types';
import { exportMetadataToWorkspace } from './actions/exportDatasetsToWorkspace/exportMetadataToWorkspace';
import { exportDataListToWorkspace } from './actions/exportDatasetsToWorkspace/exportDataListsToWorkspace';

export interface ActionCreatorFactoryItem<TAction = DataActionFunction> {
  readonly action: TAction;
}

/**
 * Creates an isolated action registry for a given action function type.
 * Returns `registerAction`, `findAction`, and a typed `NullAction` no-op.
 */
export function createActionRegistry<
  TAction extends (...args: any[]) => Promise<any>,
>() {
  const registry: Record<string, ActionCreatorFactoryItem<TAction>> = {};

  const NullAction = (() => Promise.resolve()) as unknown as TAction;

  const registerAction = (
    name: string,
    item: ActionCreatorFactoryItem<TAction>,
  ): void => {
    registry[name] = item;
  };

  const findAction = (
    name?: string,
  ): ActionCreatorFactoryItem<TAction> | undefined => {
    if (name === undefined) {
      console.error('DataLibrary: findAction: no name provided');
      return undefined;
    }
    if (!(name in registry)) {
      console.error('DataLibrary: findAction: no action found for', name);
      return undefined;
    }
    return registry[name];
  };

  return { registerAction, findAction, NullAction };
}

// Item-level (DataActionFunction) registry — preserves existing export API
const { registerAction, findAction, NullAction } =
  createActionRegistry<DataActionFunction>();

export { registerAction, findAction, NullAction };

export const registerDefaultDataLibraryActions = () => {
  registerAction('export-pfb-to-url', { action: sendExistingPFBToURL });
  registerAction('export-from-discovery-to-manifest', {
    action: exportToManifest,
  });
  registerAction('export-from-discovery-to-workspace', {
    action: exportMetadataToWorkspace,
  });
  registerAction('export-from-files-to-workspace', {
    action: exportMetadataToWorkspace,
  });
  registerAction('export-datalist-to-workspace', {
    action: exportDataListToWorkspace,
  });
};

registerDefaultDataLibraryActions();
