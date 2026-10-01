import {
  removeSowerJobsUpdatedBefore,
  sowerJobListAdapter,
  sowerJobsListReducer,
} from '../sowerJobListSlice';
import { type JobWithActions, SowerJobStage, SowerJobStatus } from '../types';

const makeJob = (
  uid: string,
  status: SowerJobStatus,
  updated: number,
): JobWithActions => ({
  uid,
  name: uid,
  status,
  created: updated,
  updated,
  stage: SowerJobStage.JobDispatched,
  actions: { dispatchJob: { action: 'test', input: {} } },
});

describe('removeSowerJobsUpdatedBefore', () => {
  const cutoff = 1_000;
  const state = sowerJobListAdapter.setAll(
    sowerJobListAdapter.getInitialState(),
    [
      makeJob('old-completed', SowerJobStatus.Completed, cutoff - 1),
      makeJob('old-failed', SowerJobStatus.Failed, cutoff - 1),
      makeJob('old-running', SowerJobStatus.Running, cutoff - 1),
      makeJob('recent-completed', SowerJobStatus.Completed, cutoff + 1),
      makeJob('at-cutoff', SowerJobStatus.Completed, cutoff),
    ],
  );

  it('removes finished jobs updated before the cutoff and keeps the rest', () => {
    const next = sowerJobsListReducer(
      state,
      removeSowerJobsUpdatedBefore(cutoff),
    );
    expect([...next.ids].sort()).toEqual(
      ['at-cutoff', 'old-running', 'recent-completed'].sort(),
    );
  });

  it('returns the same state when nothing has expired', () => {
    const next = sowerJobsListReducer(state, removeSowerJobsUpdatedBefore(0));
    expect(next).toBe(state);
  });
});
