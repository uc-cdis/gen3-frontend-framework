import {
  AdditionalDataItem,
  CohortItem,
  DataLibrary,
  DataLibraryAPIResponse,
  Datalist,
  DatalistUpdate,
  // DataListEntry,
  DataSetItems,
  isCohortItem,
  isFileItem,
  LibraryAPIItems,
  // RegisteredDataListEntry,
} from './types';
import { JSONObject } from '../../types/';

const processItem = (id: string, data: any) => {
  if (data?.type === 'AdditionalData') {
    return {
      name: data.name,
      itemType: 'AdditionalData',
      description: data?.description,
      documentationUrl: data?.documentationUrl as string,
      url: data?.url as string,
    } as AdditionalDataItem;
  }

  return {
    ...data,
    itemType: 'Data',
    guid: data.id,
    id: id, // TODO fix this hack
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
          schemaVersion: data.schema_version,
          data: data.data,
          name: data.name,
          index: data.index,
        } as CohortItem;
      } else {
        if (!(data.dataset_guid in acc.items)) {
          acc.items[data.dataset_guid as string] = {
            id: data.dataset_guid,
            name: '',
            items: { [id]: processItem(id, data) },
          };
        } else {
          (acc.items[data.dataset_guid as string].items as DataSetItems)[id] =
            processItem(id, data);
        }
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
        Object.values(item?.items ?? {}).reduce((fileCount, x) => {
          if (isFileItem(x)) {
            return fileCount + 1;
          }
          return fileCount;
        }, 0)
      );
    }
  }, 0);
};

export const getTimestamp = () => {
  return new Date(Date.now()).toLocaleString();
};

export const flattenDataList = (dataList: Datalist) => {
  // convert datalist into user-data-library for for updating.

  const items = Object.entries(dataList.items).reduce(
    (acc: LibraryAPIItems, [id, value]) => {
      if (isCohortItem(value)) {
        acc[id] = value;
      } else {
        return { ...acc, ...value.items };
      }
      return acc;
    },
    {},
  );

  return {
    name: dataList.name,
    items: items,
  } as DatalistUpdate;
};
