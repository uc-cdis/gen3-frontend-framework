import { ListMembers, SelectedMembers } from './SelectionContext';
import { DetalistMembers, DatasetContents } from '../types';

/**
 * Extracts and consolidates GUIDs and IDs from dataset contents into a single object.
 *
 * @param {DatasetContents} dataset - The dataset containing files and queries to extract IDs from.
 * @returns {SelectedMembers} An object where each key is a unique identifier from the dataset,
 *                           with a boolean value set to true.
 */
const getObjectIds = (dataset: DatasetContents): SelectedMembers => {
  return [
    ...dataset.files.map((file) => file.guid),
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
 * @param {DetalistMembers} datasetContents - Object containing details about dataset members.
 * @returns {ListMembers} - An object mapping each dataset ID to its respective member objects.
 */
export const selectAllDatasetMembers = (
  datasetIds: Array<string>,
  datasetContents: DetalistMembers,
): ListMembers => {
  return datasetIds.reduce((acc: ListMembers, datasetId) => {
    acc[datasetId] = {
      id: datasetId,
      objectIds: getObjectIds(datasetContents[datasetId]),
    };
    return acc;
  }, {});
};
