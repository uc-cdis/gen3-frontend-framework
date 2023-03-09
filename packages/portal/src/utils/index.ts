
import {
  create10ColorPallet,
  create10ColorAccessibleContrast,
} from "./colors";

export {
  create10ColorPallet,
  create10ColorAccessibleContrast,
};

/**
 * @param {number} seconds
 * @returns {string} formatted time
 */
export function now(): number {
  return Math.floor(Date.now() / 1000)
}
