import {
  AdditionalDataItem,
  CohortItem,
  DataLibrary,
  DataLibraryAPIResponse,
  Datalist,
  DatalistAPI,
  DataSetMembers,
  ExportDatasetFields,
  GroupedDataItems,
  isCohortItem,
  isFileItem,
  LibraryAPIItems,
  DatasetOrCohort,
  DataLibraryDataset,
  FileItem,
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
        // is cohort
        acc.items[id] = {
          itemType: 'Gen3GraphQL',
          id: data.guid,
          schemaVersion: data.schema_version,
          data: data.data,
          name: data.name,
          index: data.index,
        } as CohortItem;
      } else {
        // Dataset
        if (
          !(data?.dataset_guid && (data.dataset_guid as string) in acc.items)
        ) {
          acc.items[data.dataset_guid as string] = {
            id: data.dataset_guid as string,
            name: '',
            members: { [id]: processItem(id, data) },
          } as DataLibraryDataset;
        } else {
          (acc.items[data.dataset_guid as string].members as DataSetMembers)[
            id
          ] = processItem(id, data);
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

export const getTimestamp = () => {
  return new Date(Date.now()).toLocaleString();
};

export const flattenDataList = (dataList: GroupedDataItems) => {
  // convert datalist into user-data-library API for for updating.

  const items: LibraryAPIItems = Object.entries(dataList.items).reduce(
    (acc: any, [id, value]) => {
      if (isCohortItem(value)) {
        acc[id] = value;
      } else {
        return { ...acc, ...value.members };
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
 *  and creates a Object of Files grouped by their dataset guid, which is
 *  used to add these to a Data Library List
 * @param data
 * @param dataFieldMapping
 * @constructor
 */
export const groupDatasetsInRecords = (
  data: Array<Record<string, any>>,
  dataFieldMapping: ExportDatasetFields,
) => {
  const items = data.reduce(
    (acc: DatasetOrCohort, resource: Record<string, any>) => {
      const dataObjects = resource[dataFieldMapping.dataObjectField];

      // Check if dataObjects exists and is an array
      if (!dataObjects || !Array.isArray(dataObjects)) {
        return acc;
      }

      const datasetId = resource[dataFieldMapping.datasetIdField] as string; // Note: typo still preserved
      const datasetName =
        dataFieldMapping.datasetNameField &&
        dataFieldMapping.datasetNameField in resource
          ? resource[dataFieldMapping.datasetNameField]
          : undefined;
      if (datasetId === undefined) {
        return acc; // Skip if dataset ID is missing
      }

      const datafiles = dataObjects.reduce(
        (dataAcc: DatasetOrCohort, dataObject: Record<string, unknown>) => {
          const guid = dataObject[dataFieldMapping.dataObjectIdField];

          // Skip items without a valid ID
          if (typeof guid !== 'string' || !guid) {
            return dataAcc;
          }

          return {
            ...dataAcc,
            [guid]: {
              dataset_guid: datasetId as string,
              dataset_name: datasetName,
              guid: guid,
              itemType: 'Data',
              ...dataObject,
            } satisfies FileItem,
          };
        },
        {},
      );

      if (Object.keys(datafiles).length > 0)
        acc[datasetId] = {
          id: datasetId,
          members: datafiles,
          itemType: 'Dataset',
        } satisfies DataLibraryDataset;

      return acc;
    },
    {} as DatasetOrCohort,
  );

  return items;
};
