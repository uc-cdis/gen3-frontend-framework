import React, { useCallback, useEffect, useMemo } from 'react';
import {
  useAddFileManifestMutation,
  useAddMetadataManifestMutation,
} from '@gen3/core';
import DiscoveryActionButton from './DiscoveryActionButton';
import type { ExportActionButtonProps } from './types';
import { notifications } from '@mantine/notifications';
import { useIsAuthenticated } from '../../../lib/session/session';
import {
  extractFileManifest,
  getDisabledState,
  hasKeysToRemove,
  prepareMetadata,
} from './utils';
import { Icon } from '@iconify-icon/react';
import { useRouter } from 'next/router';

const ExportToWorkspaceButton = ({
  buttonConfig,
  selectedResources,
  exportDataFields,
}: ExportActionButtonProps) => {
  const { isAuthenticated } = useIsAuthenticated();
  const { disabled, disabledReason } = getDisabledState(
    isAuthenticated,
    selectedResources.length,
    buttonConfig.requiresLogin ?? false,
    'exportToWorkspace',
  );
  const [triggerFileManifestExport, fileManifestExportResults] =
    useAddFileManifestMutation();
  const [triggerMetadataExport, metadataManifestExportResults] =
    useAddMetadataManifestMutation();
  const keysToRemove: Array<string> = useMemo(
    () =>
      hasKeysToRemove(buttonConfig.params)
        ? buttonConfig.params.keysToRemove
        : [],
    [buttonConfig.params],
  );

  const router = useRouter();

  const handleExportManifestClick = useCallback(async () => {
    const { dataObjectField } = exportDataFields;

    if (!dataObjectField) {
      notifications.show({
        title: 'Error notification',
        message:
          'Missing required configuration field `config.features.export.manifestFieldName',
      });
      return;
    }
    // combine manifests from all selected studies
    const manifest = prepareMetadata(selectedResources, [
      dataObjectField,
      ...keysToRemove,
    ]);

    const fileManifest = extractFileManifest(
      selectedResources,
      dataObjectField,
    );

    // export the manifest

    if (fileManifest.length === 0) {
      notifications.show({
        title: 'Export warning',
        message:
          'None of the selected studies have any data objects. Please select a different study or select a different data object field.',
      });
      return;
    }

    // now export the manifest using the export to manifest calls

    await triggerFileManifestExport(fileManifest).unwrap();
  }, [
    exportDataFields,
    keysToRemove,
    selectedResources,
    triggerFileManifestExport,
  ]);

  useEffect(() => {
    if (fileManifestExportResults.status === 'fulfilled') {
      notifications.show({
        title: 'Export complete',
        message: 'Manifest exported to workspace. Redirecting to workspace',
      });
      void router.push('/Workspace');
    }
  }, [fileManifestExportResults, router]);

  return (
    <DiscoveryActionButton
      data-testid="download-manifest-button"
      label={buttonConfig?.label ?? 'Download Manifest'}
      icon={<Icon icon="gen3:arrow-export" width="1.25rem" height="1.25rem" />}
      disabled={disabled}
      tooltip={
        disabledReason ??
        buttonConfig?.tooltip ??
        'Export Selection to Workspace'
      }
      onClick={handleExportManifestClick}
      loading={fileManifestExportResults.status === 'pending'}
    />
  );
};

export default ExportToWorkspaceButton;
