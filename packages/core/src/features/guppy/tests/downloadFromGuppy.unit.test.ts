/**
 * @jest-environment jsdom
 */
import { downloadFromGuppyToBlob } from '../utils';
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
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    ) as jest.Mock;
  });

  // afterEach(() => {
  //   jest.restoreAllMocks();
  // });

  it('should call the function correctly', async () => {
    const spy = jest.spyOn(global, 'fetch');

    await downloadFromGuppyToBlob(downloadOptions);

    expect(onStartMock).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
  });

  it('test for onDone function', async () => {
    const spy = jest.spyOn(global, 'fetch');

    await downloadFromGuppyToBlob(downloadOptions);

    expect(spy).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
  });

  // TODO: restore this test
  //   it('test for onError function', async () => {
  //     global.fetch = jest.fn(() =>
  //       Promise.reject(new Error('Fetch error')),
  //     ) as jest.Mock;
  //
  //     await downloadFromGuppyToBlob(downloadOptions);
  //
  //     expect(onErrorMock).toHaveBeenCalledTimes(1);
  //   });
});
