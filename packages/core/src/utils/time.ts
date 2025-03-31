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
