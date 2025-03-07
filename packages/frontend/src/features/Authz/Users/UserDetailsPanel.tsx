import React from 'react';
import { Button, Group, Stack, Tabs } from '@mantine/core';
import { User } from '../types';
import { UserDetails } from './Cards';

interface UserDetailsPanelProps {
  user: User;
  closePanel: () => void;
}

const UserDetailsPanel = ({ user, closePanel }: UserDetailsPanelProps) => {
  return (
    <Stack>
      <Tabs
        defaultValue="user"
        classNames={{
          root: 'w-full',
          panel: 'w-full',
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="user">User</Tabs.Tab>
          <Tabs.Tab value="group">Groups</Tabs.Tab>
          <Tabs.Tab value="resource">Resources</Tabs.Tab>
          <Tabs.Tab value="policy">Policies</Tabs.Tab>
          <Tabs.Tab value="role">Roles</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="user" pl="xs">
          <UserDetails user={user} />
        </Tabs.Panel>
      </Tabs>
      <Group>
        <Button onClick={() => closePanel()}>Close</Button>
      </Group>
    </Stack>
  );
};

export default UserDetailsPanel;
