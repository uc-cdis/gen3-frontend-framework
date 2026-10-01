import { useEffect } from 'react';
import { removeSowerJobsUpdatedBefore, useCoreDispatch } from '@gen3/core';
import { minutesToMilliseconds } from '../../utils';
import { SowerJobExpirationConfig } from './types';

export const DEFAULT_JOB_EXPIRATION_MINUTES = 7 * 24 * 60;
export const DEFAULT_JOB_EXPIRATION_CHECK_MINUTES = 60;

/**
 * Removes finished jobs from the persisted sower job list once they are older
 * than the configured expiration, so the list doesn't grow without bound across
 * sessions. Runs once on mount (the store is already rehydrated by then) and
 * then periodically.
 */
const useSowerJobExpiration = ({
  jobExpirationMinutes = DEFAULT_JOB_EXPIRATION_MINUTES,
  jobExpirationCheckMinutes = DEFAULT_JOB_EXPIRATION_CHECK_MINUTES,
}: SowerJobExpirationConfig = {}) => {
  const dispatch = useCoreDispatch();

  useEffect(() => {
    if (jobExpirationMinutes <= 0) return;
    const maxAgeMs = minutesToMilliseconds(jobExpirationMinutes);

    const expireJobs = () => {
      dispatch(removeSowerJobsUpdatedBefore(Date.now() - maxAgeMs));
    };

    expireJobs();
    if (jobExpirationCheckMinutes <= 0) return;
    const id = setInterval(
      expireJobs,
      minutesToMilliseconds(jobExpirationCheckMinutes),
    );
    return () => clearInterval(id);
  }, [dispatch, jobExpirationMinutes, jobExpirationCheckMinutes]);
};

export default useSowerJobExpiration;
