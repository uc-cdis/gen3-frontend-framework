import { getIn, insertAt, moveItem, removeAt, setIn } from '../configPath';

describe('configPath helpers', () => {
  const base = {
    features: { search: { searchBar: { enabled: false } } },
    studyColumns: [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
  };

  test('getIn reads nested values and returns undefined for missing paths', () => {
    expect(getIn(base, ['features', 'search', 'searchBar', 'enabled'])).toBe(
      false,
    );
    expect(getIn(base, ['studyColumns', 1, 'name'])).toBe('b');
    expect(getIn(base, ['nope', 'deeper'])).toBeUndefined();
  });

  test('setIn is immutable and preserves untouched branches', () => {
    const next = setIn(
      base,
      ['features', 'search', 'searchBar', 'enabled'],
      true,
    );
    expect(next.features.search.searchBar.enabled).toBe(true);
    expect(base.features.search.searchBar.enabled).toBe(false);
    expect(next.studyColumns).toBe(base.studyColumns);
  });

  test('setIn creates missing containers', () => {
    const next = setIn({}, ['a', 0, 'b'], 1) as { a: Array<{ b: number }> };
    expect(Array.isArray(next.a)).toBe(true);
    expect(next.a[0]?.b).toBe(1);
  });

  test('setIn with undefined deletes object keys', () => {
    const next = setIn({ a: 1, b: 2 }, ['a'], undefined);
    expect(next).toEqual({ b: 2 });
    expect('a' in next).toBe(false);
  });

  test('insertAt / removeAt / moveItem', () => {
    const inserted = insertAt(base, ['studyColumns'], { name: 'd' });
    expect(inserted.studyColumns.map((c) => c.name)).toEqual([
      'a',
      'b',
      'c',
      'd',
    ]);

    const removed = removeAt(base, ['studyColumns'], 0);
    expect(removed.studyColumns.map((c) => c.name)).toEqual(['b', 'c']);

    const moved = moveItem(base, ['studyColumns'], 0, 2);
    expect(moved.studyColumns.map((c) => c.name)).toEqual(['b', 'c', 'a']);
    expect(moveItem(base, ['studyColumns'], 0, 5)).toBe(base);
  });
});
