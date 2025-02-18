import { ActionButtonFunction, ActionButtonProps } from './types';
import FileSaver from 'file-saver';
import { GEN3_DOMAIN } from '@gen3/core';
import { notifications } from '@mantine/notifications';

// create a factory for the action creators

export interface ActionCreatorFactoryItem {
  action: ActionButtonFunction;
  params?: Record<string, string>;
}

export const NullAction: ActionButtonFunction = (): void => {
  return;
};

export const registerAction = (
  actionName: string,
  action: ActionCreatorFactoryItem,
) => {
  registeredDataLibraryActions[actionName] = action;
};

export const findAction = (
  actionName: string,
): ActionButtonFunction | undefined => {
  if (!(actionName in registeredDataLibraryActions)) {
    console.error('getButtonAction: no action found for', actionName);
    return NullAction;
  }
  return registeredDataLibraryActions[actionName].action;
};

export const AddSelectionToDataLibrary = ({
  selectedResources,
  exportDataFields,
}: ActionButtonProps) => {};

const MANIFEST_FILENAME = 'manifest.json';

const handleDownloadManifest = <
  T extends Record<string, any> = Record<string, any>,
>({
  exportDataFields,
  selectedResources,
}: ActionButtonProps<T>): void => {
  const { manifestFieldName } = exportDataFields;
  if (manifestFieldName === undefined) {
    notifications.show({
      title: 'Error notification',
      message:
        'Missing required configuration field `config.features.export.manifestFieldName',
    });
    return;
  }

  // combine manifests from all selected studies
  const manifest: Array<T> = [];
  selectedResources.forEach((study) => {
    if (study[manifestFieldName]) {
      if ('commons_url' in study && !GEN3_DOMAIN?.includes(study.commons_url)) {
        // PlanX addition to allow hostname based DRS in manifest download clients
        // like FUSE
        manifest.push(
          ...study[manifestFieldName].map((x: Record<string, unknown>) => ({
            ...x,
            commons_url: 'commons_url' in x ? x.commons_url : study.commons_url,
          })),
        );
      } else {
        manifest.push(...study[manifestFieldName]);
      }
    }
  });
  // download the manifest
  const blob = new Blob([JSON.stringify(manifest, null, 2)], {
    type: 'text/json',
  });
  FileSaver.saveAs(blob, MANIFEST_FILENAME);
};

const registeredDataLibraryActions: Record<string, ActionCreatorFactoryItem> = {
  manifest: { action: handleDownloadManifest, params: {} },
};
