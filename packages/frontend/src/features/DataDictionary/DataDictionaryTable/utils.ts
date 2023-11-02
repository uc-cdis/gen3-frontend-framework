import { DataDictionary, DictionaryNode } from '../types';
import { parseDictionaryNodes } from '../utils';

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
