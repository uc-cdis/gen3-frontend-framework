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
};

export const getPropertyCount = (
  categories: Record<string, any>,
  dictionary: any,
) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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
