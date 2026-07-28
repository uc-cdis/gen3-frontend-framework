import {
  AdditionalDataItem,
  CohortItem,
  DataLibrary,
  DataLibraryAPI,
  DataLibraryAPIResponse,
  DataLibraryDataset,
  Datalist,
  DatalistAPI,
  DataSetMembers,
  DatasetOrCohort,
  ExportDatasetFields,
  FileItem,
  FileItemAPI,
  isCohortItem,
  isFileItem,
  LibraryListItemsAPI,
  LibraryListItemsGroupedByDataset,
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

export const buildListItemsGroupedByDataset = (
  listData: LibraryListItemsAPI,
): DatasetOrCohort => {
  const items: DatasetOrCohort = Object.entries(listData).reduce(
    (acc: DatasetOrCohort, [id, data]) => {
      if (data?.type === 'Gen3GraphQL') {
        const cohortData = data as CohortItem;
        acc[id] = {
          itemType: 'Gen3GraphQL',
          id: data.guid,
          schemaVersion: cohortData.schema_version,
          data: cohortData.data,
          name: data.name,
          index: cohortData.index,
        } as CohortItem;
      } else {
        // Dataset
        if (!(data?.dataset_guid && (data.dataset_guid as string) in acc)) {
          acc[data.dataset_guid as string] = {
            id: data.dataset_guid as string,
            name: '',
            members: { [id]: processItem(id, data) },
          } as DataLibraryDataset;
        } else {
          (acc[data.dataset_guid as string].members as DataSetMembers)[id] =
            processItem(id, data);
        }
      }
      return acc;
    },
    {},
  );

  return items;
};

export const BuildList = (
  listId: string,
  listData: DatalistAPI,
): Datalist | undefined => {
  if (!Object.keys(listData).includes('items')) return undefined;

  const items = buildListItemsGroupedByDataset(listData?.items ?? {});

  return {
    items: items,
    version: listData?.version ?? 0,
    created_time: listData?.created_time,
    updated_time: listData?.updated_time,
    name: listData?.name ?? listId,
    id: listId,
    authz: listData?.authz,
  };
};

/**
 * Constructs a `DataLibrary` object by transforming the input `DataLibraryAPIResponse`.
 *
 * This function takes an API response containing lists and processes each list entry.
 * It uses `BuildList` to build individual list objects for each entry in the provided data.
 * The resulting lists are accumulated and structured into a `DataLibrary` object. which
 * groups File Object by dataset_guid.
 *
 * @param {DataLibraryAPIResponse} data - The API response containing the lists to process.
 * @returns {DataLibrary} A structured `DataLibrary` object containing the processed lists.
 */
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
        Object.values(item?.members ?? {}).reduce((fileCount, x) => {
          if (isFileItem(x)) {
            return fileCount + 1;
          }
          return fileCount;
        }, 0)
      );
    }
  }, 0);
};

export const flattenDataList = (dataList: LibraryListItemsGroupedByDataset) => {
  // convert datalist into user-data-library API for for updating.

  const items: LibraryListItemsAPI = Object.entries(dataList.items).reduce(
    (acc: any, [id, value]) => {
      if (isCohortItem(value)) {
        acc[id] = value;
      } else {
        return { ...acc, ...value.members }; // TODO: might need to convert this to the API version
      }
      return acc;
    },
    {},
  );

  return {
    name: dataList.name,
    items: items,
  };
};

export const convertDatasetOrCohortToLibraryListItemsAPI = (
  list: DatasetOrCohort,
): LibraryListItemsAPI => {
  const result: LibraryListItemsAPI = {};

  // Iterate through each entry in the DatasetOrCohort object
  Object.entries(list).forEach(([datasetId, item]) => {
    if (isCohortItem(item)) {
      // Handle cohort items
      result[datasetId] = {
        itemType: 'Gen3GraphQL',
        id: item.id,
        schemaVersion: item.schemaVersion,
        data: item.data,
        name: item.name,
        index: item.index,
      } satisfies CohortItem;
    } else {
      // Handle dataset items
      const members = item.members || {};

      // Process each member of the dataset
      Object.entries(members).forEach(([memberId, memberData]) => {
        if (isFileItem(memberData)) {
          result[memberId] = {
            ...(memberData.guid && { guid: memberData.guid }),
            ...(memberData.name && { name: memberData.name }),
            ...(memberData.name && { name: memberData.name }),
            ...(memberData.description && {
              description: memberData.description,
            }),
            ...(memberData.type && { type: memberData.type }),
            dataset_guid: datasetId,
          } satisfies FileItemAPI;
        } else if (memberData.itemType === 'AdditionalData') {
          // Handle additional data items
          result[memberId] = {
            itemType: 'AdditionalData',
            name: memberData.name,
            description: memberData.description,
            documentationUrl: memberData.documentationUrl,
            url: memberData.url,
            dataset_guid: datasetId,
          } as AdditionalDataItem;
        }
      });
    }
  });

  return result;
};

export const convertDataLibraryToDataLibraryAPI = (
  dataLibrary: DataLibrary,
): DataLibraryAPI => {
  const result: DataLibraryAPI = {};
  Object.entries(dataLibrary).forEach(([listId, list]) => {
    result[listId] = {
      name: list.name,
      items: convertDatasetOrCohortToLibraryListItemsAPI(list.items),
      version: list.version,
      created_time: list.created_time,
      updated_time: list.updated_time,
      authz: list.authz,
    };
  });
  return result;
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

/**
 *  Takes a list of file items from anb array of manifest entries
 *  and creates an Object of Files grouped by their dataset guid, which is
 *  used to add these to a Data Library List
 * @param data
 * @param dataFieldMapping
 * @constructor
 */
export const extractFileDatasetsInRecords = (
  data: Array<Record<string, any>>,
  dataFieldMapping: ExportDatasetFields,
) => {
  const items: LibraryListItemsAPI = data.reduce(
    (acc: DatasetOrCohort, resource: Record<string, any>) => {
      const dataObjects = resource[dataFieldMapping.dataObjectField];

      // Check if dataObjects exists and is an array
      if (!dataObjects || !Array.isArray(dataObjects)) {
        return acc;
      }

      const datasetId = resource[dataFieldMapping.datasetIdField] as string;
      if (datasetId === undefined) {
        return acc; // Skip if dataset ID is missing
      }

      const datafiles = dataObjects.reduce(
        (dataAcc: DatasetOrCohort, dataObject: Record<string, unknown>) => {
          const fileId = dataObject[dataFieldMapping.dataObjectIdField];

          // Skip items without a valid ID
          if (typeof fileId !== 'string' || !fileId) {
            return dataAcc;
          }

          const name =
            (dataObject[
              dataFieldMapping?.dataObjectNameField ?? 'name'
            ] as string) ?? 'No Name';
          const size =
            dataObject[dataFieldMapping?.dataObjectSizeField ?? 'size'];
          let sizeString = 'N/A';
          if (typeof size === 'number') {
            sizeString = size.toString();
          }
          if (typeof size === 'string') {
            sizeString = size;
          }
          const md5Sum =
            (dataObject[
              dataFieldMapping?.dataObjectMd5sumField ?? 'md5sum'
            ] as string) ?? 'N/A';
          const url =
            (dataObject[
              dataFieldMapping?.dataObjectUrlField ?? 'url'
            ] as string) ?? 'N/A';

          let fileType = 'GA4GH_DRS';
          if (dataFieldMapping.dataObjectFileTypeValue)
            fileType = dataFieldMapping.dataObjectFileTypeValue;

          if (dataFieldMapping.dataObjectFileTypeField)
            fileType = dataObject[
              dataFieldMapping.dataObjectFileTypeField
            ] as string;

          return {
            ...dataAcc,
            [fileId]: {
              dataset_guid: datasetId as string,
              id: fileId,
              guid: fileId,
              itemType: 'Data',
              name: name,
              size: sizeString,
              md5sum: md5Sum,
              type: fileType,
              url: url,
            } satisfies FileItem,
          };
        },
        {},
      );

      return {
        ...acc,
        ...datafiles,
      };
    },
    {} as DataSetMembers,
  );

  return items;
};
