import DataLibraryActionButton from './DataLibraryActionButton';
import FileSaver from 'file-saver';
import { GEN3_DOMAIN } from '@gen3/core';
import { ActionButtonProps } from './types';
import { FiDownload as DownloadIcon } from 'react-icons/fi';
import { notifications } from '@mantine/notifications';

const MANIFEST_FILENAME = 'manifest.json';

const handleDownloadManifestClick = <
  T extends Record<string, any> = Record<string, any>,
>({
  exportDataFields,
  selectedResources,
}: ActionButtonProps<T>) => {
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

const DownloadManifestButton = ({
  selectedResources,
  exportDataFields,
}: ActionButtonProps) => {
  return (
    <DataLibraryActionButton
      label="Download Manifest"
      icon={<DownloadIcon />}
      toolTip="Download Manifest"
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
