import { useEffect } from 'react';
import { useCoreDispatch, initSowerJobsPolling } from '@gen3/core';

const SowerJobsInitializer = () => {
  const dispatch = useCoreDispatch();

  useEffect(() => {
    console.log('init sower jobs polling');
    dispatch(initSowerJobsPolling());
  }, [dispatch]);

  console.log('sower jobs polling initialized');

  return null;
};

export default SowerJobsInitializer;
