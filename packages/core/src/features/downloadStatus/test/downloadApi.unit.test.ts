// write  test for this downloadApi.ts
import { loadingStatusApi } from '../downloadApi';

// Path: packages/core/src/features/downloadStatus/test/downloadApi.unit.test.ts

describe('downloadApi', () => {
 it ('should test useGetJobListQuery', () => {
    expect(loadingStatusApi.useGetJobListQuery).toBeDefined();
  });
  it ('should test useGetDownloadStatusQuery', () => {
    expect(loadingStatusApi.useGetDownloadStatusQuery).toBeDefined();
  });

});
