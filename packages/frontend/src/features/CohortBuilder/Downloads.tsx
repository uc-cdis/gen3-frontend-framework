

import { DownloadButton } from '../../components/DownloadButtons/DownloadButton';
import { GEN3_GUPPY_API, useCoreDispatch, GuppyDownloadRequestParams, Accessibility, downloadFromGuppy } from '@gen3/core';
import { useState } from 'react';
import download from '../../utils/download';

interface DownloadToFileButtonProps extends GuppyDownloadRequestParams {
  filename: string;
  format: string;
  counts: number;
}

export const DownloadToFileButton = ( downloadParams : DownloadToFileButtonProps) => {

  const [downloading, setDownloading] = useState(false);
  const coreDispatch = useCoreDispatch();

  const handleSampleSheetDownload = () => {
    setDownloading(true);
    download({
      endpoint: `${GEN3_GUPPY_API}/download`,
      method: "POST",
      dispatch: coreDispatch,
      params: {
        ...downloadParams,
        ...(downloadParams.accessibility ? {accessibility: Accessibility.ALL} : {} )
      },
      done: () => setDownloading(false),
    });
  };


  return (
    <DownloadButton
      activeText="Downloading..."
      inactiveText="Download to file"
      endpoint={`${GEN3_GUPPY_API}/download`}
      method="POST"
      toolTip="Download cohort to file"
      params={downloadParams}
      onClick={() => handleSampleSheetDownload()}
      />
  );

};
