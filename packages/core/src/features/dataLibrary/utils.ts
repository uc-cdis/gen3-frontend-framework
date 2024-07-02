import {
  AdditionalDataItem,
  CohortItem,
  DataList,
  DataLibrary,
  DataLibraryAPIResponse,
} from './types';
import { JSONObject } from '../../types/';

export const BuildList = (
  listId: string,
  listData: JSONObject,
): DataList | undefined => {
  if (!Object.keys(listData).includes('items')) return undefined;

  const items = Object.entries(listData?.list).reduce(
    (acc, [id, data]) => {
      if (data?.type === 'AdditionalData') {
        const aData: AdditionalDataItem = {
          name: id,
          itemType: 'AdditionalData',
          description: data?.description,
          documentationUrl: data?.documentationUrl,
          url: data?.url,
        };
        acc.items[id] = aData;
      } else if (data?.type === 'Gen3GraphQL') {
        const cData: CohortItem = {
          itemType: 'Gen3GraphQL',
          guid: data.guid,
          schemaVersion: data.schemaVersion,
          data: data.data,
        };
        acc.items[id] = cData;
      } else {
        acc.items[id] = data;
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
    } as DataList,
  );
  return items;
};

export const BuildLists = (data: DataLibraryAPIResponse): DataLibrary => {
  const res = Object.entries(data?.lists).reduce((acc, [listId, listData]) => {
    const list = BuildList(listId, listData);
    if (list) acc[listId] = list;
    return acc;
  }, {} as DataLibrary);
  return res;
};
