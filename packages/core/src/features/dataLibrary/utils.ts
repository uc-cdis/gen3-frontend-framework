import {
  AdditionalDataItem,
  CohortItem,
  DataLibrary,
  DataLibraryAPIResponse,
  Datalist,
  DataListEntry,
  DataSetItems,
  isCohortItem,
  isFileItem,
  RegisteredDataListEntry,
} from './types';
import { JSONObject } from '../../types/';

const BuildDataSet = (
  setId: string,
  dataSet: DataListEntry,
): RegisteredDataListEntry => {
  const res = Object.entries(dataSet?.items).reduce((acc, [id, data]) => {
    if (data?.type === 'AdditionalData') {
      acc[id] = {
        name: data.name,
        itemType: 'AdditionalData',
        description: data?.description,
        documentationUrl: data?.documentationUrl as string,
        url: data?.url as string,
      } as AdditionalDataItem;
    } else {
      acc[id] = {
        ...data,
        itemType: 'Data',
        guid: id,
        id: id, // TODO fix this hack
      };
    }
    return acc;
  }, {} as DataSetItems);
  return {
    name: dataSet?.name,
    id: setId,
    items: res,
  };
};

export const BuildList = (
  listId: string,
  listData: JSONObject,
): Datalist | undefined => {
  if (!Object.keys(listData).includes('items')) return undefined;

  const items = Object.entries(listData?.items).reduce(
    (acc, [id, data]) => {
      if (data?.type === 'Gen3GraphQL') {
        acc.items[id] = {
          itemType: 'Gen3GraphQL',
          id: data.guid,
          schemaVersion: data.schemaVersion,
          data: data.data,
        } as CohortItem;
      } else {
        acc.items[id] = BuildDataSet(id, data);
      }
      return acc;
    },

    {
      items: {},
      version: listData?.version ?? 0,
      createdTime: listData?.created_time,
      updatedTime: listData?.updated_time,
      name: listData?.name ?? listId,
      id: listId,
      authz: {
        version: (listData.authz as JSONObject).version,
        authz: (listData as JSONObject).authz,
      },
    } as Datalist,
  );
  return items;
};

export const BuildLists = (data: DataLibraryAPIResponse): DataLibrary => {
  return Object.entries(data?.lists).reduce((acc, [listId, listData]) => {
    const list = BuildList(listId, listData as JSONObject);
    if (list) acc[listId] = list;
    return acc;
  }, {} as DataLibrary);
};

/**
 * Calculates the total number of items within a DataList object.
 *
 * @param {DataList} dataList - The DataList object to count items from.
 * @return {number} The total number of items in the DataList.
 */
export const getNumberOfItemsInDatalist = (dataList: Datalist): number => {
  if (!dataList?.items) return 0;

  return Object.values(dataList.items).reduce((count, item) => {
    if (isCohortItem(item)) {
      return count + 1;
    } else {
      return (
        count +
        Object.values(item.items).reduce((fileCount, x) => {
          if (isFileItem(x)) {
            return fileCount + 1;
          }
          return fileCount;
        }, 0)
      );
    }
  }, 0);
};