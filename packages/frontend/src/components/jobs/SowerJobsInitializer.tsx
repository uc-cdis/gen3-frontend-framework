import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initSowerJobsPolling } from '@gen3/core';

const SowerJobsInitializer: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Dispatch the initialization action when the component mounts
    dispatch(initSowerJobsPolling());

    // No cleanup needed
  }, [dispatch]);

  // This component doesn't render anything
  return null;
};

export default SowerJobsInitializer;
