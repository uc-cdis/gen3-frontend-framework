import { ExportDatasetFields } from '../types';
import { extractFileDatasetsInRecords } from '../utils';

describe('groupDatasetItems', () => {
  const dataFieldMapping: ExportDatasetFields = {
    dataObjectField: 'dataFiles',
    datasetIdField: 'datasetId',
    dataObjectIdField: 'fileId',
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
      file1: {
        dataset_guid: 'dataset1',
        fileId: 'file1',
        guid: 'file1',
        id: 'file1',
        itemType: 'Data',
        name: 'file1.txt',
      },
      file2: {
        dataset_guid: 'dataset1',
        fileId: 'file2',
        guid: 'file2',
        id: 'file2',
        itemType: 'Data',
        name: 'file2.txt',
      },
      file3: {
        dataset_guid: 'dataset2',
        fileId: 'file3',
        guid: 'file3',
        id: 'file3',
        itemType: 'Data',
        name: 'file3.txt',
      },
    };

    const result = extractFileDatasetsInRecords(data, dataFieldMapping);

    expect(result).toEqual(expectedResult);
  });

  it('should skip data objects without valid dataset IDs', () => {
    const data = [
      {
        dataFiles: [{ fileId: 'file1', name: 'file1.txt' }],
      },
    ];

    const result = extractFileDatasetsInRecords(data, dataFieldMapping);

    expect(result).toEqual({});
  });

  it('should skip data objects without a datasetIdFieldName or dataObjectFieldName', () => {
    const data = [
      {
        datasetId: 'dataset1',
      },
    ];

    const result = extractFileDatasetsInRecords(data, dataFieldMapping);

    expect(result).toEqual({});
  });

  it('should skip data objects without valid file IDs', () => {
    const data = [
      {
        datasetId: 'dataset1',
        dataFiles: [{ name: 'file1.txt' }],
      },
    ];

    const result = extractFileDatasetsInRecords(data, dataFieldMapping);

    expect(result).toEqual({});
  });

  it('should handle empty input data', () => {
    const data: Array<Record<string, unknown>> = [];

    const result = extractFileDatasetsInRecords(data, dataFieldMapping);

    expect(result).toEqual({});
  });

  it('should handle missing or undefined dataObjects field gracefully', () => {
    const data = [
      { datasetId: 'dataset1', dataFiles: undefined },
      { datasetId: 'dataset2' },
    ];

    const result = extractFileDatasetsInRecords(data, dataFieldMapping);

    expect(result).toEqual({});
  });
});
