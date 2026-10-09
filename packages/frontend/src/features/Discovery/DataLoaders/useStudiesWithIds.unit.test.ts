import { renderHook } from '@testing-library/react';
import type { JSONObject } from '@gen3/core';
import { useStudiesWithIds } from './useStudiesWithIds';

describe('useStudiesWithIds', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('returns no studies and a zero count while data is undefined', () => {
    const { result } = renderHook(() => useStudiesWithIds(undefined, 'guid'));
    expect(result.current).toEqual({ studiesWithIds: [], missingIdCount: 0 });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('drops studies without the uid field and counts them', () => {
    const studies: JSONObject[] = [
      { guid: 'a', name: 'A' },
      { name: 'no id' },
      { guid: '', name: 'empty id' },
      { guid: 'b', name: 'B' },
    ];
    const { result } = renderHook(() => useStudiesWithIds(studies, 'guid'));
    expect(result.current.studiesWithIds.map((s) => s.guid)).toEqual([
      'a',
      'b',
    ]);
    expect(result.current.missingIdCount).toBe(2);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('2 study record(s)');
  });

  it('uses the configured uid field', () => {
    const studies: JSONObject[] = [{ study_id: 's1' }, { guid: 'g1' }];
    const { result } = renderHook(() => useStudiesWithIds(studies, 'study_id'));
    expect(result.current.studiesWithIds).toEqual([{ study_id: 's1' }]);
    expect(result.current.missingIdCount).toBe(1);
  });

  it('keeps the same result reference when inputs are unchanged', () => {
    const studies: JSONObject[] = [{ guid: 'a' }];
    const { result, rerender } = renderHook(() =>
      useStudiesWithIds(studies, 'guid'),
    );
    const first = result.current.studiesWithIds;
    rerender();
    expect(result.current.studiesWithIds).toBe(first);
  });
});
