import React, { useState } from 'react';
import { useDeepCompareCallback, useDeepCompareMemo } from 'use-deep-compare';
import { useGetCSRFQuery } from '@gen3/core';
import { Center, Loader } from '@mantine/core';
import { CohortDiscoveryConfig } from './types';

const CohortDiscovery = ({ config }: { config: CohortDiscoveryConfig }) => {
  const [controlsExpanded, setControlsExpanded] = useState(true);
  const [activeFields, setActiveFields] = useState<string[]>([]); // the fields that have been selected by the user
  const { isLoading } = useGetCSRFQuery(); // need for Guppy

  const updateFields = useDeepCompareCallback(
    (field: string) => {
      if (activeFields.includes(field)) {
        setActiveFields(activeFields.filter((f) => f !== field));
      } else {
        setActiveFields([...activeFields, field]);
      }
    },
    [activeFields],
  );

  console.log('CohortDiscovery config', config);

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
