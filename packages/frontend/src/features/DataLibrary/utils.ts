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
  if (Number.isNaN(timestamp)) {
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
    timeZone: 'UTC',
  })
    .formatToParts(date)
    .filter((p) => p.type !== 'literal') // Filter out literal types like spaces and commas
    .map((p) => p.value);

  if (parts.length !== 6) throw new Error('format date wrong length');

  const day = parts.slice(0, 3).join('-');
  const time = parts.slice(3).join(':');
  return `${day} ${time}`;
};

/**
 * Retrieves the next size value from a provided size map.
 *
 * This function takes in a current size key and a mapping of size keys to values.
 * It returns the value associated with the next size key in the order of the keys
 * as defined by the `sizeMap`.
 *
 * If the current size key is not found in the `sizeMap`, the function returns the value
 * associated with the first size key. If the current size key corresponds to the last
 * size in the order, it returns the value of the last size.
 *
 * @template T
 * @param {keyof Record<string, T>} currentSize - The key representing the current size.
 * @param {Record<string, T>} sizeMap - An object mapping size keys to their corresponding values.
 * @returns {T} The value of the next size, or the last size if the current size is the last, or the first size if not found.
 */
export const getNextSize = <T>(
  currentSize: keyof Record<string, T>,
  sizeMap: Record<string, T>,
): T => {
  // Get all keys in order
  const sizes = Object.keys(sizeMap);

  // Find the current index
  const currentIndex = sizes.indexOf(currentSize);

  // If current size not found, return the first size
  if (currentIndex === -1) {
    return sizeMap[sizes[0]];
  }

  // If we're at or past the last size, return the last size value
  if (currentIndex >= sizes.length - 1) {
    return sizeMap[sizes[sizes.length - 1]];
  }

  // Return the value of the next size
  const nextSize = sizes[currentIndex + 1];
  return sizeMap[nextSize];
};
