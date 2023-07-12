import React from 'react';
import { useUserAuth } from '@gen3/core';
import { Avatar, Card, Group, LoadingOverlay, Text } from '@mantine/core';

const User = () => {
  const { data: userData, isFetching } = useUserAuth();

  return (
    <div className="w-full h-full">
      <LoadingOverlay visible={isFetching} />
      <div className="flex flex-row justify-end">
        <Card shadow="sm" radius="md" withBorder>
          <Group position="apart" mt="md" mb="xs">
            <Avatar radius="xl" color="accent.6"></Avatar>
            <Text weight={500}>{userData?.username}</Text>
          </Group>
        </Card>
      </div>
    </div>
  );
};

export default User;
