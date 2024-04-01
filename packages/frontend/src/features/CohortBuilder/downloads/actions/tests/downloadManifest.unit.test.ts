import { downloadToManifestAction, } from '../downloadManifest';
import {
  downloadJSONDataFromGuppy,
} from '@gen3/core';
import { handleDownload } from '../utils';

// add mock implementation for handleDownload
jest.mock('../utils', () => ({
  handleDownload: jest.fn(),
}));

jest.mock('@gen3/core');

describe('downloadToManifestAction function', () => {
  it('should handle download to manifest action when type equals resourceIndexType', async () => {
    const params = {
      type: 'mockResourceIndexType',
      resourceIndexType: 'mockResourceIndexType',
      filter: {},
      fields: ['md5sum', 'file_name', 'file_size'],
      accessibility: 'public',
      sort: [],
      filename: 'test_manifest.json',
      referenceIdFieldInDataIndex: 'object_id',
      fileFields: [],
      resourceIdField: 'object_id',
    };

    const done = jest.fn();
    const onError = jest.fn();
    const onAbort = jest.fn();
    const signal = {} as AbortSignal;

    (downloadJSONDataFromGuppy as jest.Mock).mockReturnValue([
      {
        'object_id': 'mocked-object-id-1',
        'md5sum': 'mocked-md5sum-1',
        'file_name': 'mocked.20130502.genotypes.vcf.gz.tbi',
        'file_size': 8077
      },
      {
        'object_id': 'mocked-object-id-2',
        'md5sum': 'mocked-md5sum-2',
        'file_name': 'mocked.20130502.genotypes.vcf.gz',
        'file_size': 5656911
      },
      {
        'object_id': 'mocked-object-id-3',
        'md5sum': 'mocked-md5sum-3',
        'file_name': 'mocked_populations.tsv',
        'file_size': 30970
      },
      {
        'object_id': 'mocked-object-id-4',
        'md5sum': 'mocked-md5sum-4',
        'file_name': 'integrated_call_samples_v3.20200731.ALL.ped',
        'file_size': 209431
      }
        ]);

    await downloadToManifestAction(params, done, onError, onAbort, signal);

    expect(handleDownload).toHaveBeenCalled();
    expect(done).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(downloadJSONDataFromGuppy).toHaveBeenCalledWith({
      onAbort: onAbort,
      signal: signal,
      parameters: {
        filter: params.filter,
        type: params.type,
        fields: [params.referenceIdFieldInDataIndex, ...params.fileFields],
        accessibility: params.accessibility,
        sort: params.sort,
        format: 'json',
      },
    });

    // Add more expect statements or tests to check if function behavior is correct
  });

  it('should handle error when no data found for the current filters', async () => {
    const params = {
      type: 'mockResourceIndexType',
      resourceIndexType: 'mockResourceIndexType',
      filter: {},
      fields: [],
      accessibility: 'public',
      sort: [],
      filename: 'test_manifest.json',
      referenceIdFieldInDataIndex: '',
      fileFields: [],
      resourceIdField: '',
    };

    const done = jest.fn();
    const onError = jest.fn();
    const onAbort = jest.fn();
    const signal = {} as AbortSignal;

    (downloadJSONDataFromGuppy as jest.Mock).mockResolvedValue([]);

    await downloadToManifestAction(params, done, onError, onAbort, signal);

    expect(onError).toHaveBeenCalledWith(new Error('No data found for the current filters'));
    expect(done).not.toHaveBeenCalled();
  });

  // Add more tests for different use cases or edge cases
});
