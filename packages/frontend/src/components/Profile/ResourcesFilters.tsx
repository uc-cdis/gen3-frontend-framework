import React, { useMemo } from 'react';
import { Stack, Checkbox, Text } from '@mantine/core';
import { useResourcesContext } from './ResourcesProvider';
import { useProfileContext } from './ProfileProvider';

interface ResourcesFiltersProps {
  setFilters: (filters: string[]) => void;
  selectedFilters: string[];
}

/**
 * ResourcesFilters creates a checkbox filter component from cached arborist data
 * and servicesAndMethods, useProfileContext context hooks.
 * @returns: A resourceFilter component for sorting permissions
 * chart on profile page by relevant microservices
 */
const ResourcesFilters = ({
  selectedFilters,
  setFilters,
}: ResourcesFiltersProps) => {
  const { servicesAndMethods } = useResourcesContext();
  const { profileConfig } = useProfileContext();

  const checkboxes = useMemo(() => {
    const serviceColors = profileConfig?.resourceTable?.serviceColors ?? {};
    return servicesAndMethods.services.map((filter: string) => (
      <Checkbox
        className="m-2"
        color={
          filter in serviceColors ? serviceColors[filter].color : 'primary'
        }
        key={filter}
        value={filter}
        label={filter}
      />
    ));
  }, [
    profileConfig?.resourceTable?.serviceColors,
    servicesAndMethods.services,
  ]);

  return (
    <div className="basis-1/4 mr-4 min-w-fit">
      <div className="flex flex-col border-1 bg-base-max border-base-light">
        <div className="bg-secondary-lighter border-base-lighter border-1 w-full py-1 px-2">
          <Text size="sm" fw={600}>
            Filter by Service
          </Text>
        </div>
        <Checkbox.Group
          value={selectedFilters}
          onChange={setFilters}
          classNames={{
            label: 'bg-secondary-lighter border-base-lighter border-1 w-full',
          }}
        >
          <Stack mt="xs">{checkboxes}</Stack>
        </Checkbox.Group>
      </div>
    </div>
  );
};

export default ResourcesFilters;
