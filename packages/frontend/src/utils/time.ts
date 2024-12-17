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

/**
 * Converts a given duration in minutes to its equivalent in milliseconds.
 *
 * @param {number} minutes - The time duration in minutes to be converted.
 * @returns {number} The equivalent duration in milliseconds.
 */
export const convertMinutesToMilliseconds = (minutes: number) =>
  minutes * 60 * 1000;

/**
 * Converts a given time in seconds to milliseconds.
 *
 * @param {number} seconds - The time in seconds to be converted.
 * @returns {number} The equivalent time in milliseconds.
 */
export const convertSecondsToMilliseconds = (seconds: number) => seconds * 1000;

// Using the built-in Date object
const getCurrentTimestamp = (): number => {
  return Date.now(); // Returns milliseconds since Unix epoch
};

// Get a readable timestamp for logging/display
const getFormattedTimestamp = (): string => {
  return new Date().toISOString();
};

// Compare two timestamps and get difference in milliseconds
const getTimeDifferenceMs = (
  startTime: number,
  endTime: number = Date.now(),
): number => {
  return endTime - startTime;
};

// Check if time difference is greater than specified minutes
const isTimeGreaterThan = (startTime: number, minutes: number): boolean => {
  const diffMs = getTimeDifferenceMs(startTime);
  const diffMinutes = diffMs / (1000 * 60);
  return diffMinutes > minutes;
};

// Get human-readable duration
const getReadableDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
};

// Example usage:
const measureExecutionTime = async (func: () => Promise<any>) => {
  const startTime = getCurrentTimestamp();
  await func();
  const duration = getTimeDifferenceMs(startTime);
  return getReadableDuration(duration);
};

// Performance monitoring with high-resolution timestamps
const getHighResolutionTimestamp = (): number => {
  return performance.now(); // More precise than Date.now() for performance measurements
};
