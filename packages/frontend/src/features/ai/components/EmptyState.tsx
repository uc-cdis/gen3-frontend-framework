import React from 'react';
import { Stack, Text } from '@mantine/core';

export interface EmptyStateProps {
  title?: string;
  description?: string;
}

const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <Stack
      align="center"
      justify="center"
      gap="xs"
      className="h-full text-center px-8 py-8 text-gray-500"
    >
      <div className="text-4xl">💬</div>
      <Text fw={600} size="md" className="text-gray-700">
        {title ?? 'Start a conversation'}
      </Text>
      {description && (
        <Text size="sm" className="max-w-[300px]">
          {description}
        </Text>
      )}
    </Stack>
  );
};

export default EmptyState;
