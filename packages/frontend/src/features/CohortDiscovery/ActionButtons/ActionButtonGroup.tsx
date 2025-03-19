import React from 'react';
import { Button, Group } from '@mantine/core';
import { ActionButtonProps } from '../types';
import SaveActionButton from './SaveActionButton';

const ActionButtonGroup: React.FC<ActionButtonProps> = ({ index }) => {
  return (
    <Group gap="xs" className="flex pt-4 pl-2">
      <SaveActionButton index={index} />
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
