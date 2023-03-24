import React from "react";
import { useUserAuth } from "@gen3/core";
import { Avatar, Card, Group, LoadingOverlay, Text } from "@mantine/core";

const User = () => {
  const { data: userData, isFetching } = useUserAuth();

  return (
    <div>
      <LoadingOverlay visible={isFetching} />
      <Card shadow="sm" radius="md" withBorder>
        <Group position="apart" mt="md" mb="xs">
          <Text weight={500}>{userData?.username}</Text>
          <Avatar color="accent.2" radius="xl"></Avatar>
        </Group>
      </Card>
    </div>
  );
};

export default User;
