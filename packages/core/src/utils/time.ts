// Using the built-in Date object
export const getCurrentTimestamp = (): number => {
  return Date.now(); // Returns milliseconds since Unix epoch
};

// Get a readable timestamp for logging/display
export const getFormattedTimestamp = (): string => {
  return new Date().toISOString();
};

// Compare two timestamps and get difference in milliseconds
export const getTimeDifferenceMs = (
  startTime: number,
  endTime: number = Date.now(),
): number => {
  return endTime - startTime;
};

// Check if time difference is greater than specified minutes
export const isTimeGreaterThan = (
  startTime: number,
  minutes: number,
): boolean => {
  const diffMs = getTimeDifferenceMs(startTime);
  const diffMinutes = diffMs / (1000 * 60);
  return diffMinutes > minutes;
};

// Get human-readable duration
export const getReadableDuration = (milliseconds: number): string => {
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
export const measureExecutionTime = async (func: () => Promise<any>) => {
  const startTime = getCurrentTimestamp();
  await func();
  const duration = getTimeDifferenceMs(startTime);
  return getReadableDuration(duration);
};

// Performance monitoring with high-resolution timestamps
export const getHighResolutionTimestamp = (): number => {
  return performance.now(); // More precise than Date.now() for performance measurements
};
export const getTimestamp = () => {
  return new Date(Date.now()).toLocaleString();
};

/**
 * Formats a given number of minutes into a human-readable uptime string.
 *
 * @param {number | null | undefined} minutes - The total number of minutes to format.
 *   - If `null` or `undefined`, a placeholder string ('—') is returned.
 *   - If less than 60, the output is formatted as `{m}m` (e.g., "45m").
 *   - If greater than or equal to 60, the output is formatted as:
 *     - `{h}h` when there are no remaining minutes (e.g., "2h").
 *     - `{h}h {m}m` when there are remaining minutes (e.g., "2h 30m").
 *
 * @returns {string} A formatted string representing the uptime in hours and minutes
 * or a placeholder if the input is null or undefined.
 */
export const formatUptimeInMinutes = (minutes: number | null | undefined): string => {
  if (minutes == null) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};
