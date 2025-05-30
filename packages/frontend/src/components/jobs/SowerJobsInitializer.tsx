import { useEffect } from 'react';
import { useCoreDispatch, initSowerPolling } from '@gen3/core';

const SowerJobsInitializer = () => {
  const dispatch = useCoreDispatch();

  useEffect(() => {
    console.log('start init sower jobs polling');
    dispatch(initSowerPolling());
  }, [dispatch]);

  console.log('sower jobs polling initialized');

  return null;
};

export default SowerJobsInitializer;
