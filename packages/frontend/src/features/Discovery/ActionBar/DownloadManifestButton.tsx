import React from 'react';
import DiscoveryActionButton from './DiscoveryActionButton';
import FileSaver from 'file-saver';
import type { ExportActionButtonProps, ExportActionProps } from './types';
import { notifications } from '@mantine/notifications';
import { useIsAuthenticated } from '../../../lib/session/session';
import { MANIFEST_FILENAME } from '../../../types/constants';
import { combineManifests, getDisabledState } from './utils';
import { Icon } from '@iconify-icon/react';

const handleDownloadManifestClick = <
  T extends Record<string, any> = Record<string, any>,
>({
  exportDataFields,
  selectedResources,
}: ExportActionProps<T>) => {
  const { dataObjectField } = exportDataFields;
  if (dataObjectField === undefined) {
    notifications.show({
      title: 'Error notification',
      message:
        'Missing required configuration field `config.features.export.manifestFieldName',
    });
    return;
  }

  // combine manifests from all selected studies
  const manifest = combineManifests<T>(selectedResources, dataObjectField);

  // download the manifest
  if (manifest.length === 0) {
    notifications.show({
      title: 'Export warning',
      message:
        'None of the selected studies have any data objects. Please select a different study or select a different data object field.',
    });
    return;
  }
  const blob = new Blob([JSON.stringify(manifest, null, 2)], {
    type: 'text/json',
  });
  FileSaver.saveAs(blob, MANIFEST_FILENAME);
};

const DownloadManifestButton = ({
  buttonConfig,
  selectedResources,
  exportDataFields,
}: ExportActionButtonProps) => {
  const { isAuthenticated } = useIsAuthenticated();
  const { disabled, disabledReason } = getDisabledState(
    isAuthenticated,
    selectedResources.length,
    buttonConfig.requiresLogin ?? false,
    'manifest',
  );

  return (
    <DiscoveryActionButton
      data-testid="download-manifest-button"
      label={buttonConfig?.label ?? 'Download Manifest'}
      icon={<Icon icon="gen3:download" width="1.25rem" height="1.25rem" />}
      disabled={disabled}
      tooltip={
        disabledReason ??
        buttonConfig?.tooltip ??
        'Download Manifest of selected studies'
      }
      onClick={() => {
        handleDownloadManifestClick({
          selectedResources: selectedResources,
          exportDataFields: exportDataFields,
        });
      }}
    />
  );
};

export default DownloadManifestButton;
