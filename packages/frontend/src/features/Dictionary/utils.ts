import {
  DictionaryCategory,
  MatchingSearchResult,
  DataDictionary,
  DictionaryEntry,
  DictionaryProperty,
} from './types';
import { capitalize } from 'lodash';
import { Data } from 'victory';

export const categoryFilter = (id: string, dictionary: Record<string, any>) =>
  id.charAt(0) !== '_' &&
  id === dictionary[id].id &&
  dictionary[id].category &&
  dictionary[id].id &&
  dictionary[id].category?.toLowerCase() !== 'internal';

export const categoryReduce = (categories: any, dictionary: DataDictionary) => {
  return categories
    .map((id: string) => dictionary[id])
    .reduce((d: DictionaryCategory<any>, property: Record<string, string>) => {
      d[property.category] ??= [];
      d[property.category].push(property);
      return d;
    }, {}) as DictionaryCategory<any>;
};

export const parseDictionaryNodes = (dictionary: DataDictionary) =>
  Object.keys(dictionary)
    .filter((id) => id.charAt(0) !== '_' && id === dictionary[id].id)
    .map((id) => {
      const originNode = dictionary[id];
      return originNode;
    })
    .filter((node) => node.category && node.id);

export const getPropertyCount = (
  categories: string[],
  dictionary: DataDictionary,
) => {
  return categories
    .map((n) => Object.keys(dictionary[n].properties)?.length ?? {})
    .reduce((acc: any, curr: any) => acc + curr);
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

/**
 * Function to convert PropertyId string to SearchPath
 *
 * @param {string} id - The PropertyId string in the format "node-category-property"
 * @returns {MatchingSearchResult} - The corresponding SearchPath object
 *
 * @typedef {object} MatchingSearchResult
 * @property {string} node - The node value extracted from the PropertyId string
 * @property {string} category - The category value extracted from the PropertyId string
 * @property {string} property - The property value extracted from the PropertyId string
 */
export const PropertyIdStringToSearchPath = (
  id: string,
): MatchingSearchResult => {
  const [node, category, property] = id.split('-');
  return { node, category, property };
};

/**
 * Concatenate the node and category properties of a MatchingSearchResult object.
 *
 * @param {MatchingSearchResult} item - The item containing the node and category properties.
 * @returns {string} - The concatenated string of the node and category.
 */
export const toNodeCategory = (item: MatchingSearchResult): string =>
  `${item.node}-${item.category}`;

/**
 * Filters out system properties from the given DataDictionary node.
 *
 * @param {DataDictionary} node - The DataDictionary node to filter properties from.
 * @returns {Object} - The filtered properties object.
 */
export const excludeSystemProperties = (
  node: DictionaryEntry,
): Record<string, DictionaryProperty> => {
  const properties =
    node.properties &&
    Object.keys(node.properties)
      .filter((key) =>
        node.systemProperties ? !node.systemProperties.includes(key) : true,
      )
      .reduce((acc, key) => {
        if (!node.properties) return acc;
        acc[key] = node.properties[key];
        return acc;
      }, {} as Record<string, DictionaryProperty>);
  return properties ?? {};
};

/**
 * Returns a modified dictionary by excluding system properties from each node's properties.
 *
 * @param {Object} dictionary - The original data dictionary.
 * @returns {DictionaryEntry} - The modified data dictionary with system properties excluded.
 */
export const getDictionaryWithExcludeSystemProperties = (
  dictionary: DataDictionary,
): Record<string, DictionaryEntry> => {
  const ret = Object.keys(dictionary)
    .map((nodeID) => {
      const node = dictionary[nodeID];
      if (!node.properties) return node;
      return {
        ...node,
        properties: excludeSystemProperties(node),
      };
    })
    .reduce((acc, node) => {
      if (!node?.id) return acc;
      acc[node.id] = node;
      return acc;
    }, {} as Record<string, DictionaryEntry>);
  return ret;
};

export const removeUnusedFieldsFromDictionaryObject = (
  obj: Record<string, any>,
) => {
  return Object.keys(obj).reduce((acc, key) => {
    if (categoryFilter(key, obj)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {} as DataDictionary);
};
