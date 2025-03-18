import React from 'react';
import { Button, Group } from '@mantine/core';

import SaveActionButton from './SaveActionButton';

const ActionButtonGroup = () => {
  return (
    <Group gap="xs" className="flex pt-4 pl-2">
      <SaveActionButton />
      <Button
        size="sm"
        variant="outline"
        color="secondary.4"
        classNames={{
          root: 'bg-base-max',
        }}
      >
        Export Cohort
      </Button>
      <Button
        size="sm"
        variant="outline"
        color="secondary.4"
        classNames={{
          root: 'bg-base-max',
        }}
      >
        Import Cohort
      </Button>
    </Group>
  );
};

export default ActionButtonGroup;
