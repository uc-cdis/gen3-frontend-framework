import React from 'react';
import DataLibraryActionButton from './DataLibraryActionButton';
import { ExportActionButtonProps } from './types';
import { FiDownload as DownloadIcon } from 'react-icons/fi';

const DownloadAsZipButton = ({
  buttonConfig,
  selectedResources,
  exportDataFields,
}: ExportActionButtonProps) => {
  return (
    <DataLibraryActionButton
      label="Download Zip"
      icon={<DownloadIcon />}
      toolTip="Download Zip"
      onClick={() => {
        console.log('Download Zip');
      }}
    />
  );
};

export default DownloadAsZipButton;
