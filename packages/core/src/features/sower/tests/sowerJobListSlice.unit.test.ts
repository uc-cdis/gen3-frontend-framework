import {
  markSowerJobsStatusStale,
  removeSowerJobsUpdatedBefore,
  retrySowerJobStatus,
  sowerJobListAdapter,
  sowerJobsListReducer,
  updateSowerJobStatus,
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

describe('Unknown status handling', () => {
  const stateWith = (status: SowerJobStatus, extra = {}) =>
    sowerJobListAdapter.setAll(sowerJobListAdapter.getInitialState(), [
      { ...makeJob('j', status, 1_000), ...extra },
    ]);
  const job = (s: ReturnType<typeof stateWith>) => s.entities['j'];

  it.each([
    SowerJobStatus.Running,
    SowerJobStatus.Completed,
    SowerJobStatus.Failed,
  ])('Unknown can move to %s and clears the stale flag', (to) => {
    const next = sowerJobsListReducer(
      stateWith(SowerJobStatus.Unknown, { statusStale: true }),
      updateSowerJobStatus({ jobId: 'j', status: to }),
    );
    expect(job(next).status).toBe(to);
    expect(job(next).statusStale).toBe(false);
  });

  it('Running can move to Unknown', () => {
    const next = sowerJobsListReducer(
      stateWith(SowerJobStatus.Running),
      updateSowerJobStatus({ jobId: 'j', status: SowerJobStatus.Unknown }),
    );
    expect(job(next).status).toBe(SowerJobStatus.Unknown);
  });

  it.each([SowerJobStatus.Completed, SowerJobStatus.Failed])(
    'a late Unknown does not regress %s',
    (from) => {
      const state = stateWith(from);
      const next = sowerJobsListReducer(
        state,
        updateSowerJobStatus({ jobId: 'j', status: SowerJobStatus.Unknown }),
      );
      expect(next).toBe(state);
    },
  );

  it('repeated Unknown does not reset the timeout clock', () => {
    const state = stateWith(SowerJobStatus.Unknown);
    const next = sowerJobsListReducer(
      state,
      updateSowerJobStatus({ jobId: 'j', status: SowerJobStatus.Unknown }),
    );
    expect(job(next).updated).toBe(1_000);
  });

  it('marks only Unknown jobs stale, and retry clears it and restarts the clock', () => {
    const running = stateWith(SowerJobStatus.Running);
    expect(
      job(sowerJobsListReducer(running, markSowerJobsStatusStale(['j'])))
        .statusStale,
    ).toBeFalsy();

    const stale = sowerJobsListReducer(
      stateWith(SowerJobStatus.Unknown),
      markSowerJobsStatusStale(['j']),
    );
    expect(job(stale).statusStale).toBe(true);

    const retried = sowerJobsListReducer(stale, retrySowerJobStatus('j'));
    expect(job(retried).statusStale).toBe(false);
    expect(job(retried).updated).toBeGreaterThan(1_000);
  });
});
