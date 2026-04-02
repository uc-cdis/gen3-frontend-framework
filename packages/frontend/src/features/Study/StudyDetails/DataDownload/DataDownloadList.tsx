import { JSONObject } from '@gen3/core';
import React from 'react';
import DownloadButtonsRow from './DownloadButtonsRow/DownloadButtonsRow';
import StandaloneDataDownloadButton from './StandaloneDataDownloadButton';
import {
  ProcessData,
  processedDatumForDataDownloadList,
} from './Utils/ProcessData';
import { Alert } from '@mantine/core';

interface DataDownloadListProps {
  readonly data: JSONObject;
}

type DataDownloadListData = {
  processedDataForDataDownloadList: processedDatumForDataDownloadList[];
  dataForDataDownloadListHasBeenTruncated: boolean;
};

const DataDownloadList = ({ data }: DataDownloadListProps) => {
  console.log('data', data);
  console.log('data.__manifest', data.__manifest);
  const DataDownloadListData = ProcessData(data['__manifest']);
  console.log('dataDownloadList', DataDownloadListData);

  const MAX_NUMBER_STAND_ALONE_DATA_DOWNLOAD_BUTTONS = 200;
  return (
    <>
      <DownloadButtonsRow data={data} />
      {DataDownloadListData.dataForDataDownloadListHasBeenTruncated && (
        <Alert
          title={`More than ${MAX_NUMBER_STAND_ALONE_DATA_DOWNLOAD_BUTTONS} files found. Visit repository to view all files.`}
        />
      )}
      {DataDownloadListData.processedDataForDataDownloadList.map((fileInfo) => (
        <StandaloneDataDownloadButton
          data={fileInfo.guid}
          title={fileInfo.title}
        />
      ))}
    </>
  );
};
export default DataDownloadList;
