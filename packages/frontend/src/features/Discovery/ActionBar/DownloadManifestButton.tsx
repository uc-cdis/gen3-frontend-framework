import DataLibraryActionButton from './DataLibraryActionButton';
import FileSaver from 'file-saver';
import { GEN3_DOMAIN } from '@gen3/core';
import { ExportActionButtonProps, ExportActionProps } from './types';
import { FiDownload as DownloadIcon } from 'react-icons/fi';
import { notifications } from '@mantine/notifications';

const MANIFEST_FILENAME = 'manifest.json';

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
  console.log('selectedResources', selectedResources);
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
  console.log(
    'DownloadManifestButton',
    buttonConfig,
    selectedResources,
    exportDataFields,
  );
  return (
    <DataLibraryActionButton
      data-testid="download-manifest-button"
      label={buttonConfig?.label ?? 'Download Manifest'}
      icon={<DownloadIcon />}
      disabled={selectedResources.length === 0 || buttonConfig?.disabled}
      toolTip={buttonConfig?.tooltip ?? 'Download Manifest of selected studies'}
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
