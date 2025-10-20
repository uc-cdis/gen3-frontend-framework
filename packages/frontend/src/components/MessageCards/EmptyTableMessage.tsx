import { Group, Text } from '@mantine/core';
import { IoMdInformationCircleOutline as InformIcon } from 'react-icons/io';
import React from 'react';

const EmptyTableMessage = ({ message }: { message: string }) => {
  return (
    <Group gap="xs" justify="center" classNames={{ root: 'w-100 my-4' }}>
      <span className="text-utility-warning">
        <InformIcon size="1.5rem" />
      </span>
      <Text fw={600}>{message}</Text>
    </Group>
  );
};

export default EmptyTableMessage;
