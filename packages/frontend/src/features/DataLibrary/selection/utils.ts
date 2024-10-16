import { DataLibrarySelectionState } from './SelectionContext';
import {
  CohortItem,
  DataLibrary,
  FileItem,
  isCohortItem,
  isFileItem,
} from '@gen3/core';
import { FileItemWithParentDatasetNameAndID } from '../types';

export const getDataLibraryItem = (
  dataLibrary: DataLibrary,
  listId: string,
  dataId: string,
  fileId?: string,
) => {
  if (!(listId in dataLibrary)) return undefined;
  if (!(dataId in dataLibrary[listId].items)) return undefined;

  const datasetOrCohort = dataLibrary[listId].items[dataId];
  const { name, id } = datasetOrCohort;
  if (isCohortItem(datasetOrCohort)) {
    return datasetOrCohort as CohortItem;
  } else {
    if (!fileId) return undefined;
    if (!(fileId in datasetOrCohort.items)) return undefined;

    if (isFileItem(datasetOrCohort.items[fileId])) {
      return {
        datasetName: name,
        datasetId: id,
        ...(datasetOrCohort.items[fileId] as FileItem),
      } as FileItemWithParentDatasetNameAndID;
    }
    return undefined;
  }
};

export interface SelectionPath {
  listId: string;
  memberId: string;
  objectId?: string;
}

export const getSelectionPaths = (
  selections: DataLibrarySelectionState,
): SelectionPath[] => {
  const paths: SelectionPath[] = [];

  for (const [listId, listMembers] of Object.entries(selections)) {
    for (const [memberId, member] of Object.entries(listMembers)) {
      if (Object.keys(member.objectIds).length === 0) {
        // If there are no objectIds, add a path with undefined objectId
        paths.push({
          listId,
          memberId,
        });
      } else {
        for (const [objectId, isSelected] of Object.entries(member.objectIds)) {
          if (isSelected) {
            paths.push({
              listId,
              memberId,
              objectId,
            });
          }
        }
      }
    }
  }
  return paths;
};

export const getSelectedItemsFromDataLibrary = (
  selections: DataLibrarySelectionState,
  dataLibrary: DataLibrary,
) => {
  const selectedPaths = getSelectionPaths(selections);

  const selectedItems = selectedPaths.map((path) => {
    return getDataLibraryItem(
      dataLibrary,
      path.listId,
      path.memberId,
      path.objectId,
    );
  });
  return selectedItems.filter((item) => item !== undefined) as (
    | CohortItem
    | FileItemWithParentDatasetNameAndID
  )[];
};
