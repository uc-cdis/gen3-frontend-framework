import React from 'react';
import type { ContextModalProps } from '@mantine/modals';
import { Text } from '@mantine/core';

export interface SowerJobFailedProps {
  message: string;
}

export const JobFailedModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<SowerJobFailedProps>) => {
  const { message } = innerProps;

  return <Text size="md"> {message}</Text>;
};
