import React, { useState } from 'react';

import {
  CoreState,
  selectIndexFilters,
  useCoreSelector,
  useGetCSRFQuery,
} from '@gen3/core';
import { Center, Loader } from '@mantine/core';
import { CohortDiscoveryConfig } from './types';

const CohortDiscovery = ({ config }: { config: CohortDiscoveryConfig }) => {
  const { isLoading } = useGetCSRFQuery(); // need for Guppy

  if (isLoading) {
    return (
      <Center maw={400} h={100} mx="auto">
        <Loader variant="dots" />
      </Center>
    );
  }

  return <div>Pending</div>;
};

export default CohortDiscovery;
