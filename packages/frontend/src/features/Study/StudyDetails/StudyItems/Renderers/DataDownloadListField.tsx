import React from 'react';
import { JSONObject, JSONValue } from '@gen3/core';
import { FieldRendererFunction } from '../RendererFactory';
import DataDownloadList from '../../DataDownload/DataDownloadList';

/**
 * Renders the DataDownloadList showing items the user can download
 *
 * @param {JSONValue} resource - JSON object containing the data from which the field's value is extracted.
 * @returns {ReactElement } A React element showing items the user can download
 */
const DataDownloadListField: FieldRendererFunction = (resource: JSONValue) => {
  return <DataDownloadList data={resource as JSONObject} />;
};

export default DataDownloadListField;
