import { DataLibrarySelectionState } from './SelectionContext';
import {
  CohortItem,
  DataLibrary,
  FileItem,
  isCohortItem,
  isFileItem,
} from '@gen3/core';

export const getDataLibraryItem = (
  dataLibrary: DataLibrary,
  listId: string,
  dataId: string,
  fileId?: string,
) => {
  if (!(listId in dataLibrary)) return undefined;
  if (!(dataId in dataLibrary[listId].items)) return undefined;

  const datasetOrCohort = dataLibrary[listId].items[dataId];
  if (isCohortItem(datasetOrCohort)) {
    return datasetOrCohort as CohortItem;
  } else {
    if (!fileId) return undefined;
    if (!(fileId in datasetOrCohort.items)) return undefined;

    if (isFileItem(datasetOrCohort.items[fileId])) {
      return datasetOrCohort.items[fileId] as FileItem;
    }
    return undefined;
  }
};

export interface SelectionPath {
  listId: string;
  memberId: string;
  objectId?: string; // Now optional
}

export const getSelectionPaths = (
  state: DataLibrarySelectionState,
): SelectionPath[] => {
  const paths: SelectionPath[] = [];

  for (const [listId, listMembers] of Object.entries(state)) {
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
