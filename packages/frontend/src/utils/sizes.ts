export const MantineSizeToString: Record<string, string> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  'xl-2': 'xl-2',
};

export const IconSize: Record<string, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  'xl-2': 36,
};

export const FontSize: Record<string, string> = {
  xs: 'var(--mantine-font-size-xs)',
  sm: 'var(--mantine-font-size-sm)',
  md: 'var(--mantine-font-size-md)',
  lg: 'var(--mantine-font-size-lg)',
  xl: 'var(--mantine-font-size-xl)',
  'xl-2': 'var(--mantine-font-size-2xl)',
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

export const getNextMantineSize = (size: string) => {
  return getNextSize(size, MantineSizeToString);
};
