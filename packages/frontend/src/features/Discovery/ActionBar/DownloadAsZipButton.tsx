import React from 'react';
import DataLibraryActionButton from './DataLibraryActionButton';
import { ActionButtonProps } from './types';
import { FiDownload as DownloadIcon } from 'react-icons/fi';

const DownloadAsZipButton = ({ selectedResources }: ActionButtonProps) => {
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
