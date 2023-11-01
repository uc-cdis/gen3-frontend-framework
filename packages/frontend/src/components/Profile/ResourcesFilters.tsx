import React, { useMemo } from 'react';
import { Stack, Checkbox } from '@mantine/core';
import { useResourcesContext } from './ResourcesProvider';
import { useProfileContext } from './ProfileProvider';

const ResourcesFilters = () => {
  const { authzMapping, servicesAndMethods } = useResourcesContext();
  const { profileConfig } = useProfileContext();

  const serviceColors = profileConfig?.resourceTable?.serviceColors ?? {};

  const checkboxes = useMemo(() => {
    return servicesAndMethods.services.map((filter) => (
      <Checkbox
        className="m-2"
        color={filter in serviceColors ? serviceColors[filter].color : 'primary'}
        key={filter}
        label={filter}
        checked={true}
        onChange={(elm) => {
          console.log(elm.target.value);
        }}
      />
    ));
  }, [authzMapping, servicesAndMethods.methods]);

  return (
    <div className="w-1/4">
      <div className="flex flex-col m-2 border-1 bg-primary-max border-base-lighter">
        {checkboxes}
      </div>
    </div>
  );
};

export default ResourcesFilters;
