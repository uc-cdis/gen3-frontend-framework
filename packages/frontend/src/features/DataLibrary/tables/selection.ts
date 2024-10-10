import { ListMembers, SelectedMembers } from './SelectionContext';
import { DatalistMembers, DatasetContents } from '../types';
import {
  CohortItem,
  Datalist,
  isCohortItem,
  isFileItem,
  RegisteredDataListEntry,
} from '@gen3/core';

/**
 * Extracts and consolidates GUIDs and IDs from dataset contents into a single object.
 *
 * @param {DatasetContents} dataset - The dataset containing files and queries to extract IDs from.
 * @returns {SelectedMembers} An object where each key is a unique identifier from the dataset,
 *                           with a boolean value set to true.
 */
const getObjectIds = (dataset: DatasetContents): SelectedMembers => {
  console.log('getObjectIds', dataset);

  return [
    ...dataset.files.map((file) => file.id),
    ...dataset.queries.map((query) => query.id),
  ].reduce((acc: SelectedMembers, key) => {
    acc[key] = true;
    return acc;
  }, {});
};

/**
 * Function that generates a mapping of dataset IDs to their respective member objects.
 *
 * @param {Array<string>} datasetIds - Array of dataset IDs to be processed.
 * @param {DatalistMembers} datasetContents - Object containing details about dataset members.
 * @returns {ListMembers} - An object mapping each dataset ID to its respective member objects.
 */
export const selectAllDatasetMembers = (
  datasetIds: Array<string>,
  datasetContents: DatalistMembers,
): ListMembers => {
  return datasetIds.reduce((acc: ListMembers, datasetId) => {
    acc[datasetId] = {
      id: datasetId,
      objectIds: getObjectIds(datasetContents[datasetId]),
    };
    return acc;
  }, {});
};

const getDatasetMembers = (
  dataSetOrCohort: RegisteredDataListEntry | CohortItem,
): SelectedMembers => {
  console.log('getDatasetMembers', dataSetOrCohort);
  if (isCohortItem(dataSetOrCohort)) {
    return { [dataSetOrCohort.id]: true };
  }
  return Object.entries(dataSetOrCohort.items).reduce(
    (acc: SelectedMembers, [key, item]) => {
      console.log('dataset', key, item);
      if (isFileItem(item)) acc[key] = true;
      return acc;
    },
    {},
  );
};

/**
 * Function that generates a mapping of dataset IDs to their respective member objects.
 *
 * @param {Datalist} members - Object containing details about dataset members.
 * @returns {ListMembers} - An object mapping each dataset ID to its respective member objects.
 */
export const selectAllListItems = (members: Datalist): ListMembers => {
  console.log('selectAll', members);
  return Object.entries(members.items).reduce(
    (acc: ListMembers, [datasetId, datasetContents]) => {
      acc[datasetId] = {
        id: datasetId,
        objectIds: getDatasetMembers(datasetContents),
      };
      return acc;
    },
    {},
  );
};
