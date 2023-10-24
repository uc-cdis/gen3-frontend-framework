import React, { useMemo } from 'react';
import { Stack, Checkbox } from '@mantine/core';
import { useResourcesContext } from './ResourcesProvider';

const ResourcesFilters = () => {
  const { authzMapping, servicesAndMethods } = useResourcesContext();

  const checkboxes = useMemo(() => {
    return servicesAndMethods.methods.map((filter) => (
      <Checkbox
        key={filter}
        label={filter}
        checked={false}
        onChange={(elm) => {
          console.log(elm.target.value);
        }}
      />
    ));
  }, [authzMapping, servicesAndMethods.methods]);

  return <div className="bg-base-lightest">
    <Stack>{checkboxes}</Stack>
    </div>;
};

export default ResourcesFilters;
