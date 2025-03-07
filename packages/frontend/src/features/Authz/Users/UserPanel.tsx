import React, { useState } from 'react';
import { useDeepCompareCallback } from 'use-deep-compare';
import UserTable from './UserTable';
import NewUserPanel from './NewUserPanel';
import UserDetailPanel from './UserDetailsPanel';
import { Button } from '@mantine/core';
import { User } from '../types';

enum UserPanelMode {
  UserTable,
  NewUserPanel,
  UserDetailPanel,
}

const NullUser: User = {
  id: '',
  tags: {
    name: '',
    email: '',
  },
};

const UserPanel = () => {
  const [mode, setMode] = useState<UserPanelMode>(UserPanelMode.UserTable);
  const [currentUser, setCurrentUser] = useState<User>(NullUser);
  const panel = useDeepCompareCallback(() => {
    switch (mode) {
      case UserPanelMode.NewUserPanel:
        return (
          <NewUserPanel closePanel={() => setMode(UserPanelMode.UserTable)} />
        );
      case UserPanelMode.UserDetailPanel:
        return (
          <UserDetailPanel
            user={currentUser}
            closePanel={() => setMode(UserPanelMode.UserTable)}
          />
        );
      case UserPanelMode.UserTable:
      default:
        return (
          <UserTable
            setCurrentUser={setCurrentUser}
            setPanelToUserDetail={() => setMode(UserPanelMode.UserDetailPanel)}
          />
        );
    }
  }, [mode, currentUser, setCurrentUser, setMode]);
  return (
    <div className="flex flex-col">
      <div className="flex justify-end items-center mb-2">
        <Button
          color="secondary"
          aria-label="create new user"
          onClick={() => setMode(UserPanelMode.NewUserPanel)}
        >
          Create New User
        </Button>
        <Button aria-label="delete user" color="secondary">
          Delete User
        </Button>
      </div>
      {panel()}
    </div>
  );
};

export default UserPanel;
