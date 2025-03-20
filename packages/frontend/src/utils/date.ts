/**
 * Converts a date into a string of YYYY-MM-DD padding 0 for months and days \< 10.
 * Note the use of UTC to ensure the GMT timezone.
 * @param d - date to convert
 */
export const convertDateToString = (d: Date | null): string | undefined => {
  if (d === null) return undefined;
  return `${d.getUTCFullYear()}-${(d.getUTCMonth() + 1) //UTC Months start at 0
    .toString()
    .padStart(2, '0')}-${d.getUTCDate().toString().padStart(2, '0')}`;
};

// https://stackoverflow.com/questions/2388115/get-locale-short-date-format-using-javascript
/**
 * Returns a formatted timestamp string based on the provided date or the current date.
 *
 * @param options - An object containing the following optional parameters:
 *   @param options.date - A Date object to format. If not provided, uses the current date.
 *   @param options.includeTimes - Boolean to include time in the output. Defaults to false.
 * @returns A timestamp in the format 'YYYY-MM-DD' if includeTimes is false, or 'YYYY-MM-DD.HHMMSS' if true.
 * If date is null it returns undefined
 *
 * Uses the Swedish ("sv-SE") locale for consistent formatting (YYYY-MM-DD HH:MM:SS).
 * Explicitly sets the time zone to the system's local time zone.
 */
export function getFormattedTimestamp(
  options: {
    date?: Date | null;
    includeTimes?: boolean;
  } = {},
): string | undefined {
  const { date = new Date(), includeTimes = false } = options;
  if (date === null) return undefined;

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  if (includeTimes) {
    Object.assign(formatOptions, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }

  const formattedDate = date.toLocaleString('sv-SE', formatOptions);

  if (includeTimes) {
    return formattedDate.replace(' ', '.').replace(/[:]/g, '');
  } else {
    return formattedDate;
  }
}

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
