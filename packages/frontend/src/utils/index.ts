import { create10ColorAccessibleContrast, create10ColorPallet } from './colors';
import { type TenStringArray } from './types';
import { getCurrentUnixTimestamp, unixTimeToString } from './time';
import { convertPathsToTree } from './convertResourcePathsToTree';

export * from './authMapping';
export * from './focusStyle';
export * from './strings';
export * from './isType';
export * from './values';
export * from './time';
export * from './access';
export * from './dataAuthorization';
export * from './cart';
export * from './validators';

export {
  type TenStringArray,
  create10ColorPallet,
  create10ColorAccessibleContrast,
  getCurrentUnixTimestamp,
  unixTimeToString,
  convertPathsToTree,
};
