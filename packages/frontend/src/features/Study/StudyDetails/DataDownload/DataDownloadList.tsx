import React from 'react';
import type { JSONObject } from '@gen3/core';
import DownloadButtonsRow from './DownloadButtonsRow/DownloadButtonsRow';
import StandaloneDataDownloadButton from './StandaloneDataDownloadButton';
import type {
  processedDatumForDataDownloadList,
  sourceFieldData,
} from './Utils/ProcessData';
import { MAX_NUMBER_OF_ITEMS_IN_LIST, processData } from './Utils/ProcessData';
import { Alert } from '@mantine/core';
import { useDiscoveryContext } from '@gen3/frontend';

interface DataDownloadListProps {
  readonly data: JSONObject;
}

type DataDownloadListData = {
  processedDataForDataDownloadList: processedDatumForDataDownloadList[];
  dataForDataDownloadListHasBeenTruncated: boolean;
};

const DataDownloadList = ({ data }: DataDownloadListProps) => {
  const { discoveryConfig } = useDiscoveryContext();
  const { dataObjectField } = discoveryConfig.features.exportFromDiscovery
    ?.exportDataFields ?? { dataObjectField: '__manifest' }; //TODO: document this default
  const dataDownloadListData = processData(
    data[dataObjectField] as sourceFieldData,
  );
  return (
    <>
      <DownloadButtonsRow data={data} />
      {dataDownloadListData.dataForDataDownloadListHasBeenTruncated && (
        <Alert
          className="mt-4 mb-4"
          title={`More than ${MAX_NUMBER_OF_ITEMS_IN_LIST} files found. Visit repository to view all files.`}
        />
      )}
      {dataDownloadListData.processedDataForDataDownloadList.map((fileInfo) => (
        <StandaloneDataDownloadButton
          key={`${fileInfo.guid}`}
          data={fileInfo.guid as unknown as JSONObject}
          title={fileInfo.title as string}
        />
      ))}
    </>
  );
};
export default DataDownloadList;
