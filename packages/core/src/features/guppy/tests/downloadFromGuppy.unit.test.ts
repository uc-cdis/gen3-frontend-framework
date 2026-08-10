import { downloadFromGuppyToBlob } from '../utils';
import { Accessibility } from '../../../constants';
import type {
  DownloadFromGuppyParams,
  GuppyDownloadDataParams,
} from '../types';

// downloadFromGuppyToBlob fires off its fetch chain without awaiting/returning
// it, so `await downloadFromGuppyToBlob(...)` only waits for the synchronous
// portion. Tests wait for the relevant callback to fire instead of assuming
// the returned promise reflects completion of the request.
const waitFor = (mock: jest.Mock): Promise<void> =>
  new Promise((resolve) => {
    mock.mockImplementation(() => resolve());
  });

describe('downloadFromGuppyToBlob', () => {
  const onStartMock = jest.fn();
  const onDoneMock = jest.fn();
  const onErrorMock = jest.fn();
  const onAbortMock = jest.fn();

  const mockParameters: GuppyDownloadDataParams = {
    type: 'file',
    filter: { mode: 'and', root: {} },
    accessibility: Accessibility.ALL,
    fields: ['file.md5sum'],
    sort: ['asc:file'],
    format: 'json',
  };

  const baseOptions: DownloadFromGuppyParams = {
    parameters: mockParameters,
    onStart: onStartMock,
    onDone: onDoneMock,
    onError: onErrorMock,
    onAbort: onAbortMock,
  };

  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('calls onStart synchronously before the request settles', () => {
    fetchSpy.mockReturnValue(new Promise(() => undefined));

    downloadFromGuppyToBlob(baseOptions);

    expect(onStartMock).toHaveBeenCalledTimes(1);
  });

  it('requests the download endpoint with the serialized filter', () => {
    fetchSpy.mockReturnValue(new Promise(() => undefined));

    downloadFromGuppyToBlob(baseOptions);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, config] = fetchSpy.mock.calls[0];
    expect(url).toMatch(/\/download$/);
    expect(config.method).toBe('POST');
    expect(JSON.parse(config.body)).toEqual({
      type: mockParameters.type,
      filter: { and: [] },
      accessibility: mockParameters.accessibility,
      fields: mockParameters.fields,
      sort: mockParameters.sort,
    });
  });

  it('resolves onDone with a Blob of the JSON response for format "json"', async () => {
    const responseData = { data: [{ id: 1 }] };
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(responseData),
    } as Response);

    downloadFromGuppyToBlob(baseOptions);
    await waitFor(onDoneMock);

    expect(onErrorMock).not.toHaveBeenCalled();
    const blob: Blob = onDoneMock.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect(JSON.parse(await blob.text())).toEqual(responseData);
  });

  it('extracts data at rootPath before converting to a Blob', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { file: [{ id: 1 }, { id: 2 }] } }),
    } as Response);

    downloadFromGuppyToBlob({
      ...baseOptions,
      parameters: { ...mockParameters, rootPath: "'data'].['file" },
    });
    await waitFor(onDoneMock);

    const blob: Blob = onDoneMock.mock.calls[0][0];
    expect(JSON.parse(await blob.text())).toEqual([[{ id: 1 }, { id: 2 }]]);
  });

  it('converts the response into the requested delimited format', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [{ a: '1', b: '2' }] }),
    } as Response);

    downloadFromGuppyToBlob({
      ...baseOptions,
      parameters: { ...mockParameters, format: 'csv' },
    });
    await waitFor(onDoneMock);

    const blob: Blob = onDoneMock.mock.calls[0][0];
    expect(await blob.text()).toBe('0_a,0_b\r\n1,2');
  });

  it('calls onError and not onDone when the response is not ok', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    } as Response);

    downloadFromGuppyToBlob(baseOptions);
    await waitFor(onErrorMock);

    expect(onDoneMock).not.toHaveBeenCalled();
    expect(onAbortMock).not.toHaveBeenCalled();
    expect(onErrorMock.mock.calls[0][0].message).toBe('Not Found');
  });

  it('calls onAbort and onError when the request is aborted', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    fetchSpy.mockRejectedValue(abortError);

    downloadFromGuppyToBlob(baseOptions);
    await waitFor(onErrorMock);

    expect(onAbortMock).toHaveBeenCalledTimes(1);
    expect(onDoneMock).not.toHaveBeenCalled();
    expect(onErrorMock).toHaveBeenCalledWith(abortError);
  });

  it('forwards the AbortSignal to fetch when provided', () => {
    fetchSpy.mockReturnValue(new Promise(() => undefined));
    const controller = new AbortController();

    downloadFromGuppyToBlob({ ...baseOptions, signal: controller.signal });

    const [, config] = fetchSpy.mock.calls[0];
    expect(config.signal).toBe(controller.signal);
  });
});
