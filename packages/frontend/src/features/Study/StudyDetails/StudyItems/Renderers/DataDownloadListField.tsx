import React from 'react';
import { JSONObject, JSONValue } from '@gen3/core';
import { FieldRendererFunction } from '../RendererFactory';
import DataDownloadList from '../../DataDownload/DataDownloadList';

const DataDownloadListField: FieldRendererFunction = (
  resource: JSONValue,
  _: string | undefined,
) => {
  return (
    <>
      <DataDownloadList data={resource as JSONObject} />
    </>
  );
};

export default DataDownloadListField;
