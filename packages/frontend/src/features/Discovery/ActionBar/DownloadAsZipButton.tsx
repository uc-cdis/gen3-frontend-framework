import React from 'react';
import DiscoveryActionButton from './DiscoveryActionButton';
import { ExportActionButtonProps } from './types';
import { FiDownload as DownloadIcon } from 'react-icons/fi';

const DownloadAsZipButton = ({
  buttonConfig,
  selectedResources,
  exportDataFields,
}: ExportActionButtonProps) => {
  return (
    <DiscoveryActionButton
      label="Download Zip"
      icon={<DownloadIcon />}
      tooltip="Download Zip"
      onClick={() => {}}
    />
  );
};

export default DownloadAsZipButton;
