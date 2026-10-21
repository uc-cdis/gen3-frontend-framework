import type { EntityState } from '@reduxjs/toolkit';
import type { CoreState } from '../../reducers';
import type { CoreStartListening } from '../../listeners';
import storage from '../../storage-persist';
import { GEN3_COMMONS_NAME } from '../../server';
import type { JobId, JobWithActions } from './types';
import { clearSowerJobs, hydrateSowerJobs } from './sowerJobListSlice';

/**
 * The sower job list belongs to the logged-in user, so it is stored under a
 * per user key rather than the shared redux-persist key. Anonymous users have
 * no jobs and nothing is stored for them.
 */
const LEGACY_PERSIST_KEY = `persist:${GEN3_COMMONS_NAME}-sower`;

export const sowerJobsStorageKey = (username: string): string =>
  `${GEN3_COMMONS_NAME}-sower-jobs:${username}`;

const selectOwner = (state: CoreState): string | undefined =>
  state.user.loginStatus === 'authenticated'
    ? state.user.data?.username
    : undefined;

const parseJobs = (
  raw: string | null,
): EntityState<JobWithActions, JobId> | undefined => {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as EntityState<JobWithActions, JobId>;
    return Array.isArray(parsed?.ids) &&
      parsed.entities !== null &&
      typeof parsed.entities === 'object'
      ? parsed
      : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Keeps state.sower.sowerJobsList in step with the logged-in user:
 * - when the user changes (login, logout, switch), the in-memory list is cleared
 *   and the new user's stored list is loaded.
 * - while a user is loaded, changes to the list are written under their key.
 */
export const registerSowerJobsPersistence = (
  startListening: CoreStartListening,
): void => {
  // remove the list stored under the old shared key, which any user could read
  void storage.removeItem(LEGACY_PERSIST_KEY);

  let handledOwner: string | undefined = undefined;
  let writable = false;

  startListening({
    predicate: (_action, currentState, previousState) =>
      selectOwner(currentState) !== selectOwner(previousState) ||
      currentState.sower.sowerJobsList !== previousState.sower.sowerJobsList,
    effect: async (_action, listenerApi) => {
      const state = listenerApi.getState();
      // renewing the session briefly clears the user, so wait for the result
      if (state.user.status === 'pending') return;

      const owner = selectOwner(state);

      if (owner !== handledOwner) {
        handledOwner = owner;
        writable = false;
        listenerApi.dispatch(clearSowerJobs());
        if (owner === undefined) return;

        let stored: string | null = null;
        try {
          stored = await storage.getItem(sowerJobsStorageKey(owner));
        } catch (error) {
          console.warn('Unable to read stored sower jobs', error);
        }
        // the user changed while loading, a later run handles the new user
        if (handledOwner !== owner) return;

        const jobs = parseJobs(stored);
        if (jobs) listenerApi.dispatch(hydrateSowerJobs(jobs));
        writable = true;
        return;
      }

      if (owner !== undefined && writable) {
        try {
          await storage.setItem(
            sowerJobsStorageKey(owner),
            JSON.stringify(state.sower.sowerJobsList),
          );
        } catch (error) {
          console.warn('Unable to store sower jobs', error);
        }
      }
    },
  });
};
