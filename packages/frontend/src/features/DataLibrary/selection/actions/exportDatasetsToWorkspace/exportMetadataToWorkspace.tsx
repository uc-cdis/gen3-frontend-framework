import React from 'react';
import { DataActionFunction } from '../../types';
import { extractDatasetIds, selectionToManifest } from '../../utils';
import {
  fetchJSONDataFromURL,
  GEN3_MANIFEST_API,
  getFederatedLoginStatus,
  HttpMethod,
  queryMultipleMDSRecords,
} from '@gen3/core';
import { Stack } from '@mantine/core';
import { modals } from '@mantine/modals';
import { ProvidersErrorPanel } from './providerErrorNotification';
import { assembleMetadata } from './utils';

interface ExportMetadataToWorkspaceParameters {
  keysToRemove: Array<string>;
  metadataRoot: string;
  useAggMDS: boolean;
  verifyExternalLogins: boolean;
}

export const exportMetadataToWorkspace: DataActionFunction = async (
  validatedSelections,
  params?: Partial<ExportMetadataToWorkspaceParameters>,
  onDone = () => null,
  onError = () => null,
  onAbort = () => null,
  signal = undefined,
) => {
  // first need to get file manifest
  try {
    const fileManifest = selectionToManifest(validatedSelections);

    if (params?.verifyExternalLogins) {
      const results = await getFederatedLoginStatus(fileManifest);

      const {
        error: providersError,
        providersToAuthenticate,
        missingProviders,
      } = results;
      if (providersError) {
        onError?.(providersError);
        return;
      }
      if (
        providersToAuthenticate &&
        providersToAuthenticate?.length > 0 &&
        missingProviders &&
        missingProviders?.length > 0
      ) {
        modals.open({
          id: 'export-discovery-to-workspace-providers-to-authenticate-modal',
          title: 'Error: Export to Workspace',
          withCloseButton: true,
          children: (
            <Stack>
              <ProvidersErrorPanel
                message="The following providers need to be authenticated"
                providers={providersToAuthenticate}
              />
              <ProvidersErrorPanel
                message="The following providers need to be authenticated"
                providers={providersToAuthenticate}
              />
            </Stack>
          ),
        });
        return;
      }
      if (providersToAuthenticate && providersToAuthenticate?.length > 0) {
        modals.open({
          id: 'export-dicovery-to-workspace-providers-to-authenticate-modal',
          title: 'Error: Export to Workspace',
          withCloseButton: true,
          children: (
            <ProvidersErrorPanel
              message="The following providers need to be authenticated"
              providers={providersToAuthenticate}
            />
          ),
        });
        return;
      } else {
        if (missingProviders && missingProviders?.length > 0) {
          modals.open({
            id: 'export-dicovery-to-workspace-providers-to-authenticate-modal',
            title: 'Error: Export to Workspace',
            withCloseButton: true,
            children: (
              <ProvidersErrorPanel
                message="The following providers are missing"
                providers={missingProviders}
              />
            ),
          });
          return;
        }
      }
    }

    // next get the metadata from the dataset id
    const metadataIds = extractDatasetIds(validatedSelections);
    const metadata = await queryMultipleMDSRecords(
      metadataIds,
      params?.useAggMDS,
      signal,
    );

    const metadataObjects = Object.values(metadata).map(
      (metadataObj) => metadataObj as Record<string, unknown>,
    );

    const filteredMetadata = assembleMetadata(
      metadataObjects,
      params?.metadataRoot ?? 'gen3_discovery',
      params?.keysToRemove,
    );

    // save the metadata
    await fetchJSONDataFromURL(
      `${GEN3_MANIFEST_API}/metadata`,
      true,
      'POST' as HttpMethod,
      JSON.stringify(filteredMetadata),
      signal,
    );

    // save files manifest
    await fetchJSONDataFromURL(
      `${GEN3_MANIFEST_API}/`,
      true,
      'POST' as HttpMethod,
      JSON.stringify(fileManifest),
      signal,
    );

    onDone?.();
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name == 'AbortError') {
        onAbort?.();
      }
    } else onError?.(new Error('unknown error'));
  }
};
