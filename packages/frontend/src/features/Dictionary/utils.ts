
import { DataDictionary, DictionaryNode } from './types';
/**
 * function to concat two words with a space in between them
 * if one of the words is empty, return the other word
 * if both words are empty, return empty string
 * if both words are not empty, return the two words with a space in between them
 *
 * @param word1 - first word to concat
 * @param word2 - second word to concat
 * @returns the two words concatenated with a space in between
 */

const concatWords = (word1: string, word2: string) => {
  if (!word1 && !word2) {
    return '';
  }

  if (!word1 || word1.length === 0) {
    return word2;
  }
  if (!word2 || word2.length === 0) {
    return word1;
  }
  return `${word1} ${word2}`;
};

export const parseDictionaryNodes = (dictionary: any) =>
  Object.keys(dictionary)
    .filter((id) => id.charAt(0) !== '_' && id === dictionary[id].id)
    .map((id) => dictionary[id])
    .filter((node) => node.category && node.id);

export const getPropertyDescription = (property: any) => {
  let description;
  if ('description' in property) {
    ({ description } = property);
  }
  if ('term' in property) {
    ({ description } = property.term);
  }
  return description;
};


export function category2NodeList(dictionary: DataDictionary) {
  /* helpers for the helper */
  const idFilter = (id: string) =>
    id.charAt(0) !== '_' && id === dictionary[id].id;

  const categoryFilter = (node: DictionaryNode) =>
    node.category && node.id && node.category.toLowerCase() !== 'internal';

  return Object.keys(dictionary)
    .filter((id) => idFilter(id))
    .map((id) => dictionary[id])
    .filter((node) => categoryFilter(node))
    .reduce((lookup, node) => {
      if (!lookup[node.category]) {
        lookup[node.category] = [];
      }
      lookup[node.category].push(node);
      return lookup;
    }, {});
}

export const getNodePropertyCount = (dictionary: DataDictionary) => {
  const res = parseDictionaryNodes(dictionary).reduce(
    (acc, node) => {
      acc.nodesCount += 1;
      acc.propertiesCount += Object.keys(node.properties).length;
      return acc;
    },
    {
      nodesCount: 0,
      propertiesCount: 0,
    },
  );
  return {
    nodesCount: res.nodesCount,
    propertiesCount: res.propertiesCount,
  };
};
