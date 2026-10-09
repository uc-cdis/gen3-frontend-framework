import { GEN3_DOMAIN } from '@gen3/core';
import type { ActionButtonType } from '../types';
import { cloneDeep } from 'lodash';
import { removeKeys } from '../../../utils/removeKey';

export interface DisabledState {
  disabled: boolean;
  disabledReason?: string;
}

const DEFAULT_NO_SELECTION_MSG =
  'You must select at least one study to perform this action';

const NO_SELECTION_MESSAGES: Partial<Record<ActionButtonType, string>> = {
  manifest: 'You must select at least one study to download a manifest',
  download: 'You must select at least one study to download a manifest',
  zip: 'You must select at least one study to download a manifest',
  exportToWorkspace:
    'You must select at least one study to export to a workspace',
  addToDataLibrary:
    'You must select at least one study to add to the data library',
};

const LOGIN_REQUIRED_MESSAGES: Record<ActionButtonType, string> = {
  manifest: 'You must be logged in to download a manifest',
  exportToWorkspace: 'You must be logged in to export to a workspace',
  externalLink: 'You must be logged in to open an external link',
  download: 'You must be logged in to download a manifest',
  zip: 'You must be logged in to download a manifest',
  addToDataLibrary: 'You must be logged in to add a study to the data library',
  link: 'You must be logged in to open an external link',
};

/**
 * Determines the disabled state and the reason for disabling based on authentication status,
 * selection count, and requirement for login.
 *
 * @returns {DisabledState} An object containing disabled status and optional reason.
 * @param isAuthenticated - Whether the user is authenticated.
 * @param numSelected - The number of selected resources.
 * @param requiresLogin - Whether login is required for the action.
 * @param type - The type of action button.
 */
export const getDisabledState = (
  isAuthenticated: boolean,
  numSelected: number,
  requiresLogin: boolean,
  type: ActionButtonType,
): DisabledState => {
  if (requiresLogin && !isAuthenticated) {
    return {
      disabled: true,
      disabledReason: LOGIN_REQUIRED_MESSAGES[type],
    };
  }

  if (numSelected === 0) {
    return {
      disabled: true,
      disabledReason: NO_SELECTION_MESSAGES[type] ?? DEFAULT_NO_SELECTION_MSG,
    };
  }

  return { disabled: false };
};

/**
 * Combines manifests from all selected studies/resources.
 * If a study defines a commons_url outside GEN3_DOMAIN, it injects the commons_url into each manifest item.
 *
 * @param selectedResources - Array of selected resources/studies.
 * @param dataObjectField - The field name in study containing data objects.
 * @returns Array of manifest items combined from selected resources.
 */
export const combineManifests = <
  T extends Record<string, any> = Record<string, any>,
>(
  selectedResources: Array<Record<string, any>>,
  dataObjectField: string,
): Array<T> => {
  const manifest: Array<T> = [];

  selectedResources.forEach((study) => {
    if (study[dataObjectField]) {
      const studyDataObject = study[dataObjectField];
      if ('commons_url' in study && !GEN3_DOMAIN?.includes(study.commons_url)) {
        // PlanX addition to allow hostname based DRS in manifest download clients
        // like FUSE
        manifest.push(
          ...studyDataObject.map((x: Record<string, unknown>) => ({
            ...x,
            commons_url: 'commons_url' in x ? x.commons_url : study.commons_url,
          })),
        );
      } else {
        manifest.push(...studyDataObject);
      }
    }
  });

  return manifest;
};

export const extractFileManifest = <
  T extends Record<string, any> = Record<string, any>,
>(
  selectedResources: Array<Record<string, any>>,
  dataObjectField: string,
): Array<T> => {
  return selectedResources.reduce<Array<T>>((acc, resource) => {
    const value = resource[dataObjectField];
    if (Array.isArray(value)) {
      acc.push(...value);
    }
    return acc;
  }, []);
};

export const hasKeysToRemove = (
  params: unknown,
): params is { keysToRemove: Array<string> } => {
  return (
    typeof params === 'object' &&
    params !== null &&
    'keysToRemove' in params &&
    Array.isArray(params.keysToRemove) &&
    params.keysToRemove.every((key) => typeof key === 'string')
  );
};

export const prepareMetadata = <
  T extends Record<string, any> = Record<string, any>,
>(
  selectedResources: Array<T>,
  keysToRemove: Array<string>,
): Array<T> => {
  return selectedResources.map((obj) => {
    const clonedObj = cloneDeep<T>(obj);
    // if there are keysToRemove, remove them
    if (keysToRemove.length > 0) {
      return removeKeys<T>(clonedObj, keysToRemove);
    }
    // Otherwise just return the cloned object
    return clonedObj;
  });
};
