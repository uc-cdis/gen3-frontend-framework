import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { selectCSRFToken } from '../user';
import { fetchJobs } from './utils';
import { CoreDispatch } from '../../store';
import { CoreState } from '../../reducers';
import { getCookie } from 'cookies-next';
import { Gen3SowerResponse, JobStatus } from './types';

const POLL_INTERVAL = 5000;
let pollTimer = null;

export const getJobs = createAsyncThunk<
  Gen3SowerResponse<JobStatus>,
  void,
  { dispatch: CoreDispatch; state: CoreState }
>('jobs/list', async (_, meta) => {
  const csrfToken = selectCSRFToken(meta.getState());
  let accessToken = undefined;
  if (process.env.NODE_ENV === 'development') {
    accessToken = getCookie('credentials_token');
  }

  return fetchJobs({
    endpoint: '/job/list',
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      credentials: 'include',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
});

export const fetchJobStatus = createAsyncThunk<
  Gen3SowerResponse<JobStatus>,
  string,
  { dispatch: CoreDispatch; state: CoreState }
>('job/status', async (uid, meta) => {
  const csrfToken = selectCSRFToken(meta.getState());
  let accessToken = undefined;
  if (process.env.NODE_ENV === 'development') {
    accessToken = getCookie('credentials_token');
  }

  return fetchJobs({
    endpoint: `/job/status?UID=${uid}`,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      credentials: 'include',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
});

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    status: 'idle',
    error: null,
    activeJobCount: 0,
  },
  reducers: {
    stopPolling: (state) => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getJobs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getJobs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.jobs = action.payload.data;
        state.activeJobCount = action.payload.filter((job) =>
          ['pending', 'running'].includes(job.status),
        ).length;
      })
      .addCase(submitJob.fulfilled, (state, action) => {
        state.jobs.push(action.payload);
        state.activeJobCount++;
      })
      .addCase(fetchJobStatus.fulfilled, (state, action) => {
        const index = state.jobs.findIndex(
          (job) => job.id === action.payload.id,
        );
        if (index !== -1) {
          const oldStatus = state.jobs[index].status;
          const newStatus = action.payload.status;
          state.jobs[index] = action.payload;

          if (oldStatus !== newStatus) {
            if (!['pending', 'running'].includes(newStatus)) {
              state.activeJobCount--;
            }
          }
        }
      });
  },
});

export const { stopPolling } = jobsSlice.actions;
export default jobsSlice.reducer;
