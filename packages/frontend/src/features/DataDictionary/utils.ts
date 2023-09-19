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
