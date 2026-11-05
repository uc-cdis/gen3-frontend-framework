import { act, renderHook } from '@testing-library/react';
import type { Bundle } from '@gen3/core';
import { useFhirSearch } from './hooks';

// What the server is asked for, and when each request lets go of RTK's cache
const mockTrigger = jest.fn();
const mockUnsubscribe = jest.fn();
const mockInitiate = jest.fn((...args: unknown[]) => args[0]);
// jest.mock runs before the consts above, so each mock is read lazily
jest.mock('@gen3/core', () => ({
  ...jest.requireActual('@gen3/core'),
  fhirApi: {
    endpoints: {
      searchFhirResource: {
        initiate: (...args: unknown[]) => mockInitiate(...args),
      },
    },
  },
  // initiate hands back what was sent, so dispatch can pass it to mockTrigger
  useCoreDispatch: () => (sent: unknown) =>
    Object.assign(mockTrigger(sent), {
      unsubscribe: () => mockUnsubscribe(sent),
    }),
}));

const bundle = (...ids: string[]): Bundle => ({
  resourceType: 'Bundle',
  total: ids.length,
  entry: ids.map((id) => ({ resource: { resourceType: 'Patient', id } })),
});

// What the trigger resolves to for a successful search
const ok = (...ids: string[]) => ({
  data: { bundle: bundle(...ids), status: 200 },
});

// The same, with a next link pointing at `page`
const okWithNext = (page: string, ...ids: string[]) => {
  const { data } = ok(...ids);
  const link = [
    { relation: 'next', url: `https://fhir.example.org/fhir/Patient/${page}` },
  ];
  return { data: { ...data, bundle: { ...data.bundle, link } } };
};

// A reply we finish by hand, to control the order replies arrive in
const deferred = () => {
  let finish: (value: unknown) => void = () => {};
  const promise = new Promise((resolve) => {
    finish = resolve;
  });
  return { promise, finish };
};

const renderSearch = (resource = 'Patient') =>
  renderHook(({ tab }) => useFhirSearch(tab), {
    initialProps: { tab: resource },
  });

beforeEach(() => {
  mockTrigger.mockReset();
  mockUnsubscribe.mockClear();
  mockInitiate.mockClear();
});

describe('useFhirSearch', () => {
  it('keeps one slot per tab', async () => {
    mockTrigger.mockResolvedValue(ok('a'));
    const { result, rerender } = renderSearch();

    await act(() => result.current.send({ gender: ['female'] }));
    rerender({ tab: 'Observation' });
    expect(result.current.result).toBeUndefined();

    rerender({ tab: 'Patient' });
    expect(result.current.result).toMatchObject({
      sent: { resource: 'Patient', params: { gender: ['female'] } },
      bundle: { total: 1 },
      loading: false,
    });
  });

  it('records the status and how long it took', async () => {
    mockTrigger.mockResolvedValue(ok('a'));
    const { result } = renderSearch();

    await act(() => result.current.send({}));
    expect(result.current.result?.status).toBe(200);
    expect(result.current.result?.ms).toEqual(expect.any(Number));
  });

  it('always sends, and keeps the old bundle while the new one loads', async () => {
    const second = deferred();
    mockTrigger
      .mockResolvedValueOnce(ok('a'))
      .mockReturnValueOnce(second.promise);
    const { result } = renderSearch();

    await act(() => result.current.send({}));
    let pending = Promise.resolve();
    act(() => {
      pending = result.current.send({});
    });
    expect(mockTrigger).toHaveBeenCalledTimes(2);
    expect(result.current.result).toMatchObject({
      loading: true,
      bundle: { total: 1 },
    });

    await act(async () => {
      second.finish(ok('b', 'c'));
      await pending;
    });
    expect(result.current.result).toMatchObject({
      loading: false,
      bundle: { total: 2 },
    });
  });

  it('ignores an older reply that arrives after a newer one', async () => {
    const first = deferred();
    const second = deferred();
    mockTrigger
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const { result } = renderSearch();

    let one = Promise.resolve();
    let two = Promise.resolve();
    act(() => {
      one = result.current.send({ name: ['old'] });
    });
    act(() => {
      two = result.current.send({ name: ['new'] });
    });
    await act(async () => {
      second.finish(ok('new'));
      await two;
    });
    await act(async () => {
      first.finish(ok('old'));
      await one;
    });

    expect(result.current.result?.bundle?.entry?.[0].resource?.id).toBe('new');
    expect(result.current.result?.sent.params).toEqual({ name: ['new'] });
  });

  it('puts a reply in the tab it was sent from, even after switching', async () => {
    const reply = deferred();
    mockTrigger.mockReturnValueOnce(reply.promise);
    const { result, rerender } = renderSearch();

    let pending = Promise.resolve();
    act(() => {
      pending = result.current.send({});
    });
    rerender({ tab: 'Observation' });
    await act(async () => {
      reply.finish(ok('a'));
      await pending;
    });

    expect(result.current.result).toBeUndefined();
    rerender({ tab: 'Patient' });
    expect(result.current.result?.bundle?.total).toBe(1);
  });

  it('keeps the error and its status', async () => {
    mockTrigger.mockResolvedValue({
      error: { status: 404, data: { detail: 'Not Found' } },
    });
    const { result } = renderSearch();

    await act(() => result.current.send({ birthdate: ['notadate'] }));
    expect(result.current.result).toMatchObject({
      loading: false,
      status: 404,
      error: { status: 404 },
    });
    expect(result.current.result?.bundle).toBeUndefined();
  });

  it('lets the error win over the old data RTK hands back on a failed re-Send', async () => {
    mockTrigger.mockResolvedValue({
      ...ok('old'),
      error: { status: 404, data: { detail: 'Not Found' } },
    });
    const { result } = renderSearch();

    await act(() => result.current.send({}));
    expect(result.current.result?.status).toBe(404);
    expect(result.current.result?.bundle).toBeUndefined();
  });
});

describe('useFhirSearch paging', () => {
  const sendThenNext = async () => {
    mockTrigger
      .mockResolvedValueOnce(okWithNext('?_page_token=A', 'a', 'b'))
      .mockResolvedValueOnce(ok('c'));
    const hook = renderSearch();
    await act(() => hook.result.current.send({ gender: ['female'] }));
    await act(async () => {
      await hook.result.current.next?.();
    });
    return hook;
  };

  it('has no Back on page 1, and no Next without a next link', async () => {
    mockTrigger.mockResolvedValue(ok('a'));
    const { result } = renderSearch();

    await act(() => result.current.send({}));
    expect(result.current.next).toBeUndefined();
    expect(result.current.back).toBeUndefined();
  });

  it("Next sends the next link's query string and remembers page 1", async () => {
    const { result } = await sendThenNext();

    expect(mockTrigger).toHaveBeenLastCalledWith({
      resource: 'Patient',
      params: { gender: ['female'] },
      page: '?_page_token=A',
    });
    expect(result.current.result).toMatchObject({
      offset: 2,
      trail: [{ page: undefined, offset: 0 }],
      bundle: { total: 1 },
    });
    expect(result.current.next).toBeUndefined();
    expect(result.current.back).toEqual(expect.any(Function));
  });

  it('Back asks for the page before again', async () => {
    const { result } = await sendThenNext();
    mockTrigger.mockResolvedValueOnce(okWithNext('?_page_token=A', 'a', 'b'));

    await act(async () => {
      await result.current.back?.();
    });
    expect(mockTrigger).toHaveBeenLastCalledWith({
      resource: 'Patient',
      params: { gender: ['female'] },
      page: undefined,
    });
    expect(result.current.result).toMatchObject({ offset: 0, trail: [] });
    expect(result.current.back).toBeUndefined();
  });

  it('Retry sends the same request again, page and all', async () => {
    const { result } = await sendThenNext();
    const before = result.current.result?.sent;
    mockTrigger.mockResolvedValueOnce(ok('c'));

    await act(async () => {
      await result.current.retry?.();
    });
    expect(mockTrigger).toHaveBeenLastCalledWith(before);
    // A new object, so the race check can tell the two requests apart
    expect(result.current.result?.sent).not.toBe(before);
    expect(result.current.result).toMatchObject({
      offset: 2,
      trail: [{ offset: 0 }],
    });
  });

  it('a new Send starts again at page 1', async () => {
    const { result } = await sendThenNext();
    mockTrigger.mockResolvedValueOnce(ok('z'));

    await act(() => result.current.send({ gender: ['male'] }));
    expect(result.current.result).toMatchObject({ offset: 0, trail: [] });
  });

  it('keeps the pager while Back from the last page loads', async () => {
    const { result } = await sendThenNext();
    expect(result.current.result?.nextPage).toBeUndefined();
    const reply = deferred();
    mockTrigger.mockReturnValueOnce(reply.promise);

    let pending: Promise<void> | undefined = Promise.resolve();
    act(() => {
      pending = result.current.back?.();
    });
    expect(result.current.result).toMatchObject({
      trail: [],
      loading: true,
      paged: true,
    });

    await act(async () => {
      reply.finish(okWithNext('?_page_token=A', 'a', 'b'));
      await pending;
    });
    expect(result.current.result).toMatchObject({ loading: false });
    expect(result.current.result?.paged).toBeUndefined();
  });

  it('has no pager while the first search loads', () => {
    mockTrigger.mockReturnValueOnce(deferred().promise);
    const { result } = renderSearch();

    act(() => {
      void result.current.send({});
    });
    expect(result.current.result).toMatchObject({
      loading: true,
      paged: false,
    });
  });

  it('asks the server again every time, then lets go of the cached copy', async () => {
    mockTrigger.mockResolvedValue(ok('a'));
    const { result } = renderSearch();

    await act(() => result.current.send({}));
    const sent = result.current.result?.sent;
    expect(mockInitiate).toHaveBeenCalledWith(sent, { forceRefetch: true });
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    expect(mockUnsubscribe).toHaveBeenCalledWith(sent);
  });

  it('keeps a slow request subscribed while another tab sends', async () => {
    const slow = deferred();
    mockTrigger
      .mockReturnValueOnce(slow.promise)
      .mockResolvedValueOnce(ok('o'));
    const { result, rerender } = renderSearch();

    let pending = Promise.resolve();
    act(() => {
      pending = result.current.send({});
    });
    rerender({ tab: 'Observation' });
    await act(() => result.current.send({}));

    // Only Observation's finished request let go
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    expect(mockUnsubscribe).toHaveBeenCalledWith(
      expect.objectContaining({ resource: 'Observation' }),
    );

    await act(async () => {
      slow.finish(ok('p'));
      await pending;
    });
    expect(mockUnsubscribe).toHaveBeenCalledWith(
      expect.objectContaining({ resource: 'Patient' }),
    );
    rerender({ tab: 'Patient' });
    expect(result.current.result?.bundle?.total).toBe(1);
  });

  it('stops loading even if the request throws', async () => {
    const logged = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockTrigger.mockRejectedValueOnce(new Error('boom'));
    const { result } = renderSearch();

    await act(() => result.current.send({}));
    expect(result.current.result).toMatchObject({
      status: 'PARSING_ERROR',
      loading: false,
    });
    // Not stuck: the request can be sent again
    expect(result.current.retry).toBeDefined();
    expect(logged).toHaveBeenCalled();
    logged.mockRestore();
  });
});
