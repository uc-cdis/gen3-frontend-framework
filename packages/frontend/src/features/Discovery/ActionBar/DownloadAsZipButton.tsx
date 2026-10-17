import React from 'react';
import type { ExportActionButtonProps } from './types';
import { FiDownload as DownloadIcon } from 'react-icons/fi';
import SubmitSowerJobButton from '../../Sower/actions/SubmitSowerJobButton';
import generateFilenameWithoutPrefix from '../../../utils/generateFilenameWithoutPrefix';
import { processZipFileMetadata } from './utils';

const DownloadAllAsZipButton = ({
  buttonConfig,
  selectedResources,
  exportDataFields,
}: ExportActionButtonProps) => {
  const { dataObjectField, datasetIdField } = exportDataFields;

  const fileMetadata = processZipFileMetadata(
    datasetIdField,
    dataObjectField,
    'all_files',
    selectedResources,
  );
  let zipFilename;
  if (Object.keys(fileMetadata).length === 1) {
    zipFilename = generateFilenameWithoutPrefix(
      'all_files',
      Object.keys(fileMetadata)[0],
    );
  } else {
    zipFilename = generateFilenameWithoutPrefix('all_files');
  }

  return (
    <SubmitSowerJobButton
      label={buttonConfig.label ?? 'Export Zip'}
      rightIcon={<DownloadIcon />}
      tooltipText="Download Zippy"
      actions={{
        jobAction: {
          name: 'export-files-to-zip',
          parameters: {
            zipFilename: `${zipFilename}.zip`,
            fileMetadata,
          },
        },
        outputAction: {
          name: 'showSowerJobComplete',
        },
      }}
    />
  );
};

export default DownloadAllAsZipButton;
