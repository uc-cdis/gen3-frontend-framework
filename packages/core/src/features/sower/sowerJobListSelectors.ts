import { createSelector } from '@reduxjs/toolkit';
import type { CoreState } from '../../reducers';
import { sowerJobListSelectors } from './sowerJobListSlice';

export const selectSowerJobsList = createSelector(
  (state: CoreState) => state,
  (state) => sowerJobListSelectors.selectAll(state),
);
export const selectSowerJobListById = sowerJobListSelectors.selectById;
