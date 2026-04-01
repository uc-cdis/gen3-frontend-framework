import { JSONObject } from '@gen3/core';
import React from 'react';

interface DataDownloadListProps {
  readonly data: JSONObject;
}

const DataDownloadList = ({ data }: DataDownloadListProps) => {
  console.log('data from DataDownloadList', data);
  return <>DataDownloadList</>;
};
export default DataDownloadList;
