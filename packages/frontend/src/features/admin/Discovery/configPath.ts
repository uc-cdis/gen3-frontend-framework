/**
 * Small immutable path helpers used by the Discovery config editor.
 * Paths are arrays of object keys / array indexes, e.g.
 *   ['features', 'search', 'searchBar', 'enabled']
 *   ['studyColumns', 2, 'name']
 */
export type ConfigPath = ReadonlyArray<string | number>;

const isContainer = (x: unknown): x is Record<string | number, unknown> =>
  typeof x === 'object' && x !== null;

export const getIn = (obj: unknown, path: ConfigPath): unknown => {
  let current: unknown = obj;
  for (const key of path) {
    if (!isContainer(current)) return undefined;
    current = current[key];
  }
  return current;
};

/**
 * Returns a copy of obj with value set at path. Missing intermediate
 * containers are created (array when the next key is a number, object
 * otherwise). Setting `undefined` removes the key from an object.
 */
export const setIn = <T>(obj: T, path: ConfigPath, value: unknown): T => {
  if (path.length === 0) return value as T;
  const [key, ...rest] = path;
  const source: unknown = obj;
  const container: Record<string | number, unknown> | unknown[] = Array.isArray(
    source,
  )
    ? [...source]
    : isContainer(source)
      ? { ...source }
      : typeof key === 'number'
        ? []
        : {};

  const child = (container as Record<string | number, unknown>)[key as string];
  const next = setIn(child, rest, value);

  if (next === undefined && !Array.isArray(container)) {
    delete (container as Record<string, unknown>)[key as string];
  } else {
    (container as Record<string | number, unknown>)[key as string] = next;
  }
  return container as T;
};

const asArray = (x: unknown): unknown[] => (Array.isArray(x) ? x : []);

export const insertAt = <T>(
  obj: T,
  path: ConfigPath,
  item: unknown,
  index?: number,
): T => {
  const arr = [...asArray(getIn(obj, path))];
  arr.splice(index ?? arr.length, 0, item);
  return setIn(obj, path, arr);
};

export const removeAt = <T>(obj: T, path: ConfigPath, index: number): T => {
  const arr = asArray(getIn(obj, path)).filter((_, i) => i !== index);
  return setIn(obj, path, arr);
};

export const moveItem = <T>(
  obj: T,
  path: ConfigPath,
  from: number,
  to: number,
): T => {
  const arr = [...asArray(getIn(obj, path))];
  if (from < 0 || from >= arr.length || to < 0 || to >= arr.length) return obj;
  const [item] = arr.splice(from, 1);
  arr.splice(to, 0, item);
  return setIn(obj, path, arr);
};
