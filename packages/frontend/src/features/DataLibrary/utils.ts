/**
 * Formats a given date string into a specific format.
 *
 * @param {string} datestr - The date string to be formatted.
 * @returns {string} The formatted date string.
 * @throws {Error} Throws an error if the provided date string is invalid or the format is incorrect.
 *
 * The function parses the provided date string into a timestamp.
 */
export const formatDate = (datestr: string): string => {
  const timestamp = Date.parse(datestr);
  if (isNaN(timestamp)) {
    throw new Error('Invalid date string');
  }

  const date = new Date(timestamp);

  const parts = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .formatToParts(date)
    .filter((p) => p.type !== 'literal') // Filter out literal types like spaces and commas
    .map((p) => p.value);

  if (parts.length !== 6) throw new Error('format date wrong length');

  const day = parts.slice(0, 3).join('-');
  const time = parts.slice(3).join(':');
  return `${day} ${time}`;
};
