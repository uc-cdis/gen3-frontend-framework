import React from 'react';
import { JSONObject } from '@gen3/core';
import DownloadButtonsRow from './DownloadButtonsRow/DownloadButtonsRow';
import StandaloneDataDownloadButton from './StandaloneDataDownloadButton';
import {
  MAX_NUMBER_OF_ITEMS_IN_LIST,
  ProcessData,
  processedDatumForDataDownloadList,
  sourceFieldData,
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
  const DataDownloadListData = ProcessData(
    data['__manifest'] as sourceFieldData,
  );
  return (
    <>
      <DownloadButtonsRow data={data} />
      {DataDownloadListData.dataForDataDownloadListHasBeenTruncated && (
        <Alert
          className="mt-4 mb-4"
          title={`More than ${MAX_NUMBER_OF_ITEMS_IN_LIST} files found. Visit repository to view all files.`}
        />
      )}
      {DataDownloadListData.processedDataForDataDownloadList.map((fileInfo) => (
        <StandaloneDataDownloadButton
          data={fileInfo.guid as unknown as JSONObject}
          title={fileInfo.title as string}
        />
      ))}
    </>
  );
};
export default DataDownloadList;
