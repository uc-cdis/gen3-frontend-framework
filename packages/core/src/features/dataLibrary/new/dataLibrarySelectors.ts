import { CoreState } from '../../../reducers';
import { DataLibrary } from '../types';
import { dataLibraryListAdapter } from './dataLibrarySlice';

/**
 * Returns the selectors for the cohorts EntityAdapter
 * @param state - the CoreState
 *
 * @hidden
 */
export const dataLibrarySelectors = dataLibraryListAdapter.getSelectors(
  (state: CoreState) => state.dataLibrary,
);

export const selectDataLibraryLists = (state: CoreState): DataLibrary =>
  dataLibrarySelectors.selectEntities(state);
