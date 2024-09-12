import React from 'react';
import { useGetCSRFQuery } from '@gen3/core';
import { Center, Loader } from '@mantine/core';

const CohortDiscovery = () => {
  const { isLoading } = useGetCSRFQuery();

  if (isLoading) {
    return (
      <Center maw={400} h={100} mx="auto">
        <Loader variant="dots" />
      </Center>
    );
  }
};
