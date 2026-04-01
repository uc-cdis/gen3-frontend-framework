import { JSONObject } from '@gen3/core';
import React from 'react';
import DownloadButtonsRow from './DownloadButtonsRow/DownloadButtonsRow';
import StandaloneDataDownloadButton from './StandaloneDataDownloadButton';

interface DataDownloadListProps {
  readonly data: JSONObject;
}

const DataDownloadList = ({ data }: DataDownloadListProps) => {
  console.log('data from DataDownloadList', data);
  return (
    <>
      <DownloadButtonsRow data={data} />
      <StandaloneDataDownloadButton data={data} />
    </>
  );
};
export default DataDownloadList;
