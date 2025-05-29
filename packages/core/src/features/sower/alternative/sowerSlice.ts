// import { asyncThunkCreator, buildCreateSlice } from '@reduxjs/toolkit';
// import { DispatchJobResponse, JobStatus, JobWithActions } from './types';
// import { fetchJSONDataFromURL } from '../../utils/fetch';
// import { GEN3_SOWER_API } from '../../constants';
// import { DataStatus } from '../../dataAccess';
//
// export const createSowerApiSlice = buildCreateSlice({
//   creators: { asyncThunk: asyncThunkCreator },
// });
//
// type SowerJobUpdatePayload = Pick<JobWithActions, 'status' | 'jobId'>;
// type SowerJobUpdateObjectGUID = Pick<JobWithActions, 'outputGUID' | 'jobId'>;
//
// export interface SowerJobsListState {
//   jobs: Record<string, JobWithActions>;
//   listStatus: DataStatus;
//   jobStatusStatus: DataStatus;
//   error?: string;
// }
//
// const initialState: SowerJobsListState = {
//   jobs: {},
//   listStatus: 'uninitialized',
//   jobStatusStatus: 'uninitialized',
//   error: undefined,
// };
//
// const sowerApiSlice = createSowerApiSlice({
//   name: 'sowerApiSlice',
//   initialState,
//   reducers: (create) => ({
//     addSowerJob: create.reducer<JobWithActions>((state, action) => {
//       if (!Object.keys(state.jobs).includes(action.payload.jobId)) {
//         state.jobs[action.payload.jobId] = action.payload;
//       }
//     }),
//     updateSowerJob: create.reducer<SowerJobUpdatePayload>((state, action) => {
//       if (Object.keys(state.jobs).includes(action.payload.jobId)) {
//         state.jobs[action.payload.jobId] = {
//           ...state.jobs[action.payload.jobId],
//           ...action.payload,
//           updated: Date.now(),
//         };
//       }
//     }),
//     updateOutputGUID: create.reducer<SowerJobUpdateObjectGUID>(
//       (state, action) => {
//         if (Object.keys(state.jobs).includes(action.payload.jobId)) {
//           state.jobs[action.payload.jobId] = {
//             ...state.jobs[action.payload.jobId],
//             outputGUID: action.payload.outputGUID,
//             updated: Date.now(),
//           };
//         }
//       },
//     ),
//     removeSowerJob: create.reducer<string>((state, action) => {
//       delete state.jobs[action.payload];
//     }),
//     clearSowerJobsId: create.reducer(() => {
//       return initialState;
//     }),
//     fetchJobList: create.asyncThunk(
//       async () => {
//         return await fetchJSONDataFromURL<Array<JobStatus>>(
//           `${GEN3_SOWER_API}/list`,
//         );
//       },
//       {
//         pending: (state) => {
//           state.listStatus = 'pending';
//         },
//         rejected: (state, action) => {
//           state.listStatus = 'rejected';
//           state.error = action.error.message;
//         },
//         fulfilled: (state, action) => {
//           state.listStatus = 'fulfilled';
//           const currentJobs = state.jobs;
//           if (action.payload)
//             action.payload.forEach((job) => {
//               const existingJob =
//                 job.uid in currentJobs ? currentJobs[job.uid] : undefined;
//               if (existingJob) {
//                 state.jobs[job.uid] = {
//                   ...(existingJob ?? {}),
//                   updated: Date.now(),
//                   status: job.status,
//                 };
//               } else {
//                 const timestamp = Date.now();
//                 state.jobs[job.uid] = {
//                   jobId: job.uid,
//                   status: job.status,
//                   part: 1,
//                   updated: timestamp,
//                   created: timestamp,
//                   name: job.name,
//                 };
//               }
//             });
//           return state;
//         },
//       },
//     ),
//     fetchJobStatus: create.asyncThunk(
//       async (uid: string) => {
//         return await fetchJSONDataFromURL<DispatchJobResponse>(
//           `${GEN3_SOWER_API}/status?UID=${uid}`,
//         );
//       },
//       {
//         pending: (state) => {
//           state.jobStatusStatus = 'pending';
//         },
//         rejected: (state, action) => {
//           state.jobStatusStatus = 'rejected';
//           state.error = action.error.message;
//         },
//         fulfilled: (state, action) => {
//           state.jobStatusStatus = 'fulfilled';
//           if (action.payload) {
//             const existingJob =
//               action.payload.uid in state.jobs
//                 ? state.jobs[action.payload.uid]
//                 : undefined;
//             if (existingJob) {
//               state.jobs[action.payload.uid] = {
//                 ...existingJob,
//                 updated: Date.now(),
//                 status: action.payload.status,
//               };
//             }
//           }
//           return state;
//         },
//       },
//     ),
//   }),
// });
//
// export const sowerJobsListSliceReducer = sowerApiSlice.reducer;
//
// export const {
//   addSowerJob,
//   removeSowerJob,
//   clearSowerJobsId,
//   updateSowerJob,
//   updateOutputGUID,
//   fetchJobList,
//   fetchJobStatus,
// } = sowerApiSlice.actions;
