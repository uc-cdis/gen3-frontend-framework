import { ExportDatasetFields } from '../types';
import { groupDatasetsInRecords } from '../utils';

describe('groupDatasetItems', () => {
  const dataFieldMapping: ExportDatasetFields = {
    dataObjectField: 'dataFiles',
    datasetIdField: 'datasetId',
    dataObjectIdField: 'fileId',
    datasetNameField: 'studyName',
  };

  it('should group data objects by their dataset ID', () => {
    const data = [
      {
        datasetId: 'dataset1',
        studyName: 'study1',
        dataFiles: [
          { fileId: 'file1', name: 'file1.txt' },
          { fileId: 'file2', name: 'file2.txt' },
        ],
      },
      {
        datasetId: 'dataset2',
        studyName: 'study2',
        dataFiles: [{ fileId: 'file3', name: 'file3.txt' }],
      },
    ];

    const expectedResult = {
      dataset1: {
        id: 'dataset1',
        itemType: 'Dataset',
        members: {
          file1: {
            dataset_guid: 'dataset1',
            dataset_name: 'study1',
            fileId: 'file1',
            guid: 'file1',
            itemType: 'Data',
            name: 'file1.txt',
          },
          file2: {
            dataset_guid: 'dataset1',
            dataset_name: 'study1',
            fileId: 'file2',
            guid: 'file2',
            itemType: 'Data',
            name: 'file2.txt',
          },
        },
      },
      dataset2: {
        id: 'dataset2',
        itemType: 'Dataset',
        members: {
          file3: {
            dataset_guid: 'dataset2',
            dataset_name: 'study2',
            fileId: 'file3',
            guid: 'file3',
            itemType: 'Data',
            name: 'file3.txt',
          },
        },
      },
    };

    const result = groupDatasetsInRecords(data, dataFieldMapping);

    expect(result).toEqual(expectedResult);
  });

  it('should skip data objects without valid dataset IDs', () => {
    const data = [
      {
        dataFiles: [{ fileId: 'file1', name: 'file1.txt' }],
      },
    ];

    const result = groupDatasetsInRecords(data, dataFieldMapping);

    expect(result).toEqual({});
  });

  it('should skip data objects without a datasetIdFieldName or dataObjectFieldName', () => {
    const data = [
      {
        datasetId: 'dataset1',
      },
    ];

    const result = groupDatasetsInRecords(data, dataFieldMapping);

    expect(result).toEqual({});
  });

  it('should skip data objects without valid file IDs', () => {
    const data = [
      {
        datasetId: 'dataset1',
        dataFiles: [{ name: 'file1.txt' }],
      },
    ];

    const result = groupDatasetsInRecords(data, dataFieldMapping);

    expect(result).toEqual({});
  });

  it('should handle empty input data', () => {
    const data: Array<Record<string, unknown>> = [];

    const result = groupDatasetsInRecords(data, dataFieldMapping);

    expect(result).toEqual({});
  });

  it('should handle missing or undefined dataObjects field gracefully', () => {
    const data = [
      { datasetId: 'dataset1', dataFiles: undefined },
      { datasetId: 'dataset2' },
    ];

    const result = groupDatasetsInRecords(data, dataFieldMapping);

    expect(result).toEqual({});
  });
});
