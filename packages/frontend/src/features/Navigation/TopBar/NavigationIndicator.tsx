import React from 'react';
import { Indicator } from '@mantine/core';
import { selectSowerJobsList, useCoreSelector } from '@gen3/core';

export interface NavigationNotifierProps {
  children: React.ReactNode;
}

const NavigationNotifier = ({ children }: NavigationNotifierProps) => {
  const jobs = useCoreSelector(selectSowerJobsList);
  const visible = jobs.some((job) => job.status === 'Running');

  return (
    <Indicator
      inline
      position="middle-end"
      color="utility.1"
      size={22}
      withBorder
      processing
      offset={16}
      disabled={!visible}
    >
      {children}
    </Indicator>
  );
};

export default NavigationNotifier;
