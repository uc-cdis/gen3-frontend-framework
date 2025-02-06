import React from 'react';
import { Group, ThemeIcon, Text } from '@mantine/core';
import { IoMdInformationCircleOutline as InformIcon } from 'react-icons/io';

const EmptyList: React.FC = () => {
  return (
    <Group gap="xs" classNames={{ root: 'w-100' }}>
      <span className="text-utility-warning">
        <InformIcon size="1.5rem" />
      </span>
      <Text fw={600}>list is empty</Text>
    </Group>
  );
};

export default EmptyList;
