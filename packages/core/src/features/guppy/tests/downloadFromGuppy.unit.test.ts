import { downloadFromGuppy } from '../utils';
import { Accessibility } from '../../../constants';
import { DownloadFromGuppyParams, GuppyDownloadDataParams } from '../types';

describe('Test for downloadFromGuppy function', () => {
  const onDoneMock = jest.fn();
  const onStartMock = jest.fn();
  const onErrorMock = jest.fn();
  const mockParameters: GuppyDownloadDataParams = {
    type: 'file',
    filter: { mode: 'and', root: {} },
    accessibility: Accessibility.ALL,
    fields: ['file.mdSum'],
    sort: ['asc:file'],
    format: 'json',
  };

  const downloadOptions: DownloadFromGuppyParams = {
    parameters: mockParameters,
    onStart: onStartMock,
    onDone: onDoneMock,
    onError: onErrorMock,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call the function correctly', () => {
    downloadFromGuppy(downloadOptions);
    expect(onStartMock).toHaveBeenCalledTimes(1);
    expect(downloadFromGuppy).toHaveBeenCalledWith(downloadOptions);
  });

  it('test for onDone function', () => {
    downloadFromGuppy(downloadOptions);
    expect(onDoneMock).toHaveBeenCalledTimes(1);
  });

  it('test for onError function', () => {
    downloadFromGuppy(downloadOptions);
    expect(onErrorMock).toHaveBeenCalledTimes(0);
  });

  // mock the fetch function
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({}),
    }),
  ) as jest.Mock;
});
