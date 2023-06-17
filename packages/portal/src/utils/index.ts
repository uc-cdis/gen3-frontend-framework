import { create10ColorPallet, create10ColorAccessibleContrast } from './colors';
export { create10ColorPallet, create10ColorAccessibleContrast };


/**
 * @returns {string} formatted time
 */
export function now(): number {
  return Math.floor(Date.now() / 1000);
}

// hash function for a string
// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
export function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}
// convert unix timestamp to date time string
export function unixTimeToString(unixTime: number): string {
  return new Date(unixTime * 1000).toLocaleString();
}
