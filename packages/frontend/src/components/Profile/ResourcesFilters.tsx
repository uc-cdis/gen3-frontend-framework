import React, { useMemo, useState } from 'react';
import { Stack, Checkbox } from '@mantine/core';
import { useResourcesContext } from './ResourcesProvider';
import { useProfileContext } from './ProfileProvider';

interface ResourcesFiltersProps {
  setFilters: (filters: string[]) => void;
  selectedFilters: string[];
}

const ResourcesFilters = ({ selectedFilters, setFilters} : ResourcesFiltersProps) => {
  const { servicesAndMethods } = useResourcesContext();
  const { profileConfig } = useProfileContext();


  const checkboxes = useMemo(() => {
    const serviceColors = profileConfig?.resourceTable?.serviceColors ?? {};
    return servicesAndMethods.services.map((filter:string) => (
      <Checkbox
        className="m-2"
        color={filter in serviceColors ? serviceColors[filter].color : 'primary'}
        key={filter}
        value={filter}
        label={filter}
      />
    ));
  }, [profileConfig?.resourceTable?.serviceColors, servicesAndMethods.services]);

  return (
    <div className="w-1/4">
      <div className="flex flex-col m-2 border-1 bg-primary-max border-base-lighter">
        <Checkbox.Group value={selectedFilters} onChange={setFilters}
        label="Filter by service">
          <Stack mt="xs">
          {checkboxes}
            </Stack>
        </Checkbox.Group>

      </div>
    </div>
  );
};

export default ResourcesFilters;
