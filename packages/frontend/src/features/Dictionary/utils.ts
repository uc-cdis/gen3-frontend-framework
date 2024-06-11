import { DictionaryCategory, MatchingSearchResult } from './types';
import { capitalize } from 'lodash';

export const categoryFilter = (id: string, dictionary: any) =>
  id.charAt(0) !== '_' &&
  id === dictionary[id].id &&
  dictionary[id].category &&
  dictionary[id].id &&
  dictionary[id].category.toLowerCase() !== 'internal';

export const categoryReduce = (categories: any, dictionary: any) => {
  return categories
    .map((id: string) => dictionary[id])
    .reduce((d: DictionaryCategory<any>, property: Record<string, string>) => {
      d[property.category] ??= [];
      d[property.category].push(property);
      return d;
    }, {}) as DictionaryCategory<any>;
};

export const getPropertyCount = (
  categories: Record<string, any>,
  dictionary: any,
) => {
  return (
    categories
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .map((n) => Object.keys(dictionary[n]?.properties)?.length ?? 0)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .reduce((acc, curr) => acc + curr)
  );
};

/**
 * Converts snake_case string to label format.
 *
 * @param {string} snakeCase - The snake_case string to convert.
 * @returns {string} - The resulting label format string.
 */
export const snakeCaseToLabel = (snakeCase?: string): string => {
  if (typeof snakeCase !== 'string' || !snakeCase) {
    return 'undefined';
  }
  const words = snakeCase.split('_').filter((word) => word.length > 0);
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const snakeSplit = (snake: string) => {
  return snake
    .split('_')
    .map((name) => capitalize(name))
    .join(' ');
};

export const SearchPathToPropertyIdString = (item: MatchingSearchResult) =>
  `${item.node}-${item.category}-${item.property}`;
export const PropertyIdStringToSearchPath = (
  id: string,
): MatchingSearchResult => {
  const [node, category, property] = id.split('-');
  return { node, category, property };
};
export const toPropertyIdString = (
  node: string,
  category: string,
  property: string,
) => `${node}-${category}-${property}`;
