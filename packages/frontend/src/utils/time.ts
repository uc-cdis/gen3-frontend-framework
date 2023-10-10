/**
 * @returns {number} time in seconds since Unix epoch.
 */
export function getCurrentUnixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * convert unix timestamp to date time string
 * @param {number} unixTime
 * @returns {string} date time string
 */
export function unixTimeToString(unixTime: number): string {
  return new Date(unixTime * 1000).toLocaleString();
}
