import DataLibraryActionButton from './DataLibraryActionButton';
import FileSaver from 'file-saver';
import { GEN3_DOMAIN, isAuthenticated } from '@gen3/core';
import { ExportActionButtonProps, ExportActionProps } from './types';
import { FiDownload as DownloadIcon } from 'react-icons/fi';
import { notifications } from '@mantine/notifications';
import { useIsAuthenticated } from '../../../lib/session/session';
const MANIFEST_FILENAME = 'manifest.json';

/**
 * Determines the disabled state and the reason for disabling based on authentication status,
 * selection count, and requirement for login.
 *
 * @param {boolean} isAuthenticated - Indicates whether the user is authenticated.
 * @param {number} numSelected - The number of items selected for the operation.
 * @param {boolean} requiresLogin - Specifies whether login is required to perform the operation.
 * @returns {Object} An object containing the following properties:
 *   - {boolean} disabled - True if the action should be disabled, false otherwise.
 *   - {string} [disabledReason] - The reason why the action is disabled (if applicable).
 */
const getDisabledState = (
  isAuthenticated: boolean,
  numSelected: number,
  requiresLogin: boolean,
) => {
  const LOGIN_REQUIRED_MSG = 'You must be logged in to download a manifest';
  const NO_SELECTION_MSG =
    'You must select at least one study to download a manifest';

  if (requiresLogin && !isAuthenticated) {
    return {
      disabled: true,
      disabledReason: LOGIN_REQUIRED_MSG,
    };
  }

  if (numSelected === 0) {
    return {
      disabled: true,
      disabledReason: NO_SELECTION_MSG,
    };
  }

  return { disabled: false }; // Default enabled state.
};

const handleDownloadManifestClick = <
  T extends Record<string, any> = Record<string, any>,
>({
  exportDataFields,
  selectedResources,
}: ExportActionProps<T>) => {
  const { dataObjectFieldName } = exportDataFields;
  if (dataObjectFieldName === undefined) {
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
    if (study[dataObjectFieldName]) {
      if ('commons_url' in study && !GEN3_DOMAIN?.includes(study.commons_url)) {
        // PlanX addition to allow hostname based DRS in manifest download clients
        // like FUSE
        manifest.push(
          ...study[dataObjectFieldName].map((x: Record<string, unknown>) => ({
            ...x,
            commons_url: 'commons_url' in x ? x.commons_url : study.commons_url,
          })),
        );
      } else {
        manifest.push(...study[dataObjectFieldName]);
      }
    }
  });
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
    buttonConfig?.requiresLogin ?? false,
  );
  return (
    <DataLibraryActionButton
      data-testid="download-manifest-button"
      label={buttonConfig?.label ?? 'Download Manifest'}
      icon={<DownloadIcon />}
      disabled={disabled}
      toolTip={
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
