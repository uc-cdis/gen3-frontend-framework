import React from 'react';
import { ExportActionButtonProps } from './types';
import { FiDownload as DownloadIcon } from 'react-icons/fi';
import SubmitSowerJobButton from '../../Sower/actions/SubmitSowerJobButton';
import { useLazyGetIndexdMetdataQuery } from '@gen3/core';

const DownloadAllAsZipButton = ({
  buttonConfig,
  selectedResources,
  exportDataFields,
}: ExportActionButtonProps) => {
  const [trigger, results] = useLazyGetIndexdMetdataQuery();

  // create a file manifest by first getting file metadata

  // create study metadata

  return (
    <SubmitSowerJobButton
      label={buttonConfig.label ?? 'Export Zip'}
      rightIcon={<DownloadIcon />}
      tooltipText="Download Zip"
      actions={{
        jobAction: {
          name: 'Download Zip',
          parameters: {
            zipFilename: 'study_datafile.zip',
            fileMetadata: {
              selectedResources,
              exportDataFields,
            },
          },
        },
      }}
    />
  );
};

export default DownloadAllAsZipButton;
