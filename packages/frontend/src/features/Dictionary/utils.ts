
import { DictionaryCategory } from './types';

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
}

export const getPropertyCount = (categories: any, dictionary: any) => {
  return categories.map((n) => Object.keys(dictionary[n]?.properties)?.length ?? 0)
  .reduce((acc, curr) => acc + curr)
}
