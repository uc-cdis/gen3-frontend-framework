import {
  AdditionalDataItem,
  CohortItem,
  DataLibrary,
  DataLibraryAPIResponse,
  Datalist,
  DatalistAPI,
  DatalistAsItems,
  // DataListEntry,
  DataSetItems,
  isCohortItem,
  isFileItem,
} from './types';
import { parse } from 'graphql';
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
  listData: DatalistAPI,
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
        if (
          !(data?.dataset_guid && (data.dataset_guid as string) in acc.items)
        ) {
          acc.items[data.dataset_guid as string] = {
            id: data.dataset_guid as string,
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
      created_time: listData?.created_time,
      updated_time: listData?.updated_time,
      name: listData?.name ?? listId,
      id: listId,
      authz: listData?.authz,
    } as Datalist,
  );
  return items;
};

export const BuildLists = (data: DataLibraryAPIResponse): DataLibrary => {
  return Object.entries(data?.lists).reduce((acc, [listId, listData]) => {
    const list = BuildList(listId, listData);
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
    (acc: any, [id, value]) => {
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
  } as unknown as DatalistAsItems;
};

export const extractIndexFromDataLibraryCohort = (query: JSONObject) => {
  try {
    const parsedQuery = parse(query['query'] as string);
    const aggregationField = parsedQuery.definitions
      .filter((def) => def.kind === 'OperationDefinition')
      .flatMap((def) => def.selectionSet.selections)
      .find((sel) => sel.kind === 'Field' && sel.name.value === '_aggregation');

    if (aggregationField && 'selectionSet' in aggregationField) {
      const indexField = aggregationField?.selectionSet?.selections.find(
        (sel) => sel.kind === 'Field',
      );
      return indexField ? indexField.name.value : null;
    }
  } catch (error) {
    console.error('Invalid GraphQL query:', error);
  }
  return null;
};
