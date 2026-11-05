import React from 'react';
import { useUserAuth } from '@gen3/core';
import { Avatar, Card, Group, LoadingOverlay, Text } from '@mantine/core';

const User = () => {
  const { data: userData, isFetching } = useUserAuth();
  const displayName =
    userData?.email || userData?.preferred_username || userData?.username;
  return (
    <div className="w-full h-full">
      <LoadingOverlay visible={isFetching} />
      <div className="flex flex-row justify-end">
        <Card shadow="sm" radius="md" withBorder>
          <Group justify="space-between" mt="md" mb="xs">
            <Avatar radius="xl" color="accent.6" />
            <Text fw={500}>{displayName}</Text>
          </Group>
        </Card>
      </div>
    </div>
  );
};

export default User;
