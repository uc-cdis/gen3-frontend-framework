import React from 'react';
import { Indicator } from '@mantine/core';
import { selectSowerJobsList, useCoreSelector } from '@gen3/core';

export interface NavigationNotifierProps {
  children: React.ReactNode;
}

const NavigationNotifier = ({ children }: NavigationNotifierProps) => {
  const jobs = useCoreSelector(selectSowerJobsList);
  const runningJobs = jobs.filter((job) => job.status === 'Running');

  return (
    <Indicator
      inline
      label={runningJobs.length}
      maxValue={99}
      position="top-end"
      color="utility.1"
      size={22}
      withBorder
      processing
      offset={16}
      disabled={runningJobs.length === 0}
    >
      {children}
    </Indicator>
  );
};

export default NavigationNotifier;
