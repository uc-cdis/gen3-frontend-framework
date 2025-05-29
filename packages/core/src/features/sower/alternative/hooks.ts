// import { useRef } from 'react';
// import { fetchJobList } from './sowerSlice';
// import { selectSowerJobList } from '../jobsListSelectors';
// import { useCoreDispatch, useCoreSelector } from '../../../hooks';
// import { useEffect } from 'react';
//
// export const useGetJobListFromService = (pollingIntervalMs?: number) => {
//   const coreDispatch = useCoreDispatch();
//   const { jobs, status, error } = useCoreSelector(selectSowerJobList);
//   const action = fetchJobList();
//   const timerRef = useRef<NodeJS.Timeout | null>(null);
//
//   useEffect(() => {
//     if (status === 'uninitialized' || status !== 'pending') {
//       coreDispatch(action);
//     }
//     // Setup polling interval if specified and not uninitialized
//     if (pollingIntervalMs && status !== 'uninitialized') {
//       // Clear any existing timer
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//       }
//
//       // Start new polling interval
//       timerRef.current = setInterval(() => {
//         if (status !== 'pending') {
//           coreDispatch(action);
//         }
//       }, pollingIntervalMs);
//     }
//
//     // Cleanup function to clear interval when component unmounts or dependencies change
//     return () => {
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//         timerRef.current = null;
//       }
//     };
//   }, [status, coreDispatch, action, pollingIntervalMs]);
//
//   return {
//     jobs,
//     error,
//     isUninitialized: status === 'uninitialized',
//     isFetching: status === 'pending',
//     isSuccess: status === 'fulfilled',
//     isError: status === 'rejected',
//   };
// };
