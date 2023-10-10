import { create10ColorAccessibleContrast, create10ColorPallet } from "./colors";
import { type TenStringArray } from "./types";

export { create10ColorPallet, create10ColorAccessibleContrast };
export { type TenStringArray };

import { getCurrentUnixTimestamp, unixTimeToString } from "./time";
export { getCurrentUnixTimestamp, unixTimeToString };

// separate function for hashing logic
function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

// hash function for a string
export function hashCode(str: string) {
  if (str === null || str === '') {
    return 0;
  }
  return hashString(str);
}
