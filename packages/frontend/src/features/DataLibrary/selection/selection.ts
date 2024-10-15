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

/**
 * Retrieves the members of a given dataset or cohort.
 *
 * This function takes either a dataset or a cohort item and returns an
 * object representing the selected members. In the case of a cohort item,
 * it returns an object with the cohort's ID set to true. For a dataset,
 * it iterates through the dataset items and sets the keys of file items
 * to true in the returned object.
 *
 * @param {RegisteredDataListEntry | CohortItem} dataSetOrCohort - The dataset or cohort item to process.
 * @returns {SelectedMembers} An object representing the selected members.
 */
export const getDatasetMembers = (
  dataSetOrCohort: RegisteredDataListEntry | CohortItem,
): SelectedMembers => {
  if (isCohortItem(dataSetOrCohort)) {
    return { [dataSetOrCohort.id]: true };
  }
  return Object.entries(dataSetOrCohort.items).reduce(
    (acc: SelectedMembers, [key, item]) => {
      if (isFileItem(item)) acc[key] = true;
      return acc;
    },
    {},
  );
};

/**
 * Selects all list items from the provided data list and transforms them into a ListMembers structure.
 *
 * @param {Datalist} members - The data list containing items to be transformed.
 * @return {ListMembers} - Transformed structure containing the selected list items with dataset IDs and their corresponding object IDs.
 */
export const selectAllListItems = (members: Datalist): ListMembers => {
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
