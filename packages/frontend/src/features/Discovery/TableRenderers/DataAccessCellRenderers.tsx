import React from 'react';
import { CellRenderFunctionProps } from './types';
import { AccessLevel } from '../types';
import { Group } from '@mantine/core';
import {
  LuClock as PendingIcon,
  LuUnlock as UnlockedIcon,
  LuLock as LockedIcon,
  LuCircleSlash as NotAvailableIcon,
} from 'react-icons/lu';

export const DataAccessCellRenderer = ({ value }: CellRenderFunctionProps) => {
  if ((value as AccessLevel) === AccessLevel.WAITING) {
    return (
      <PendingIcon color="yellow">
        Your access to this study is pending.
      </PendingIcon>
    );
  }
  if ((value as AccessLevel) === AccessLevel.MIXED) {
    return (
      <Group>
        <LockedIcon color="yellow"></LockedIcon>
        <UnlockedIcon color="green">You have mixed to this study.</UnlockedIcon>
      </Group>
    );
  }

  if ((value as AccessLevel) === AccessLevel.NOT_AVAILABLE) {
    return (
      <NotAvailableIcon color="red">
        Cannot determine access to this study. Please contact the study owner.
      </NotAvailableIcon>
    );
  }
  if ((value as AccessLevel) === AccessLevel.ACCESSIBLE) {
    return (
      <UnlockedIcon color="green">You have access to this study.</UnlockedIcon>
    );
  }
  if ((value as AccessLevel) === AccessLevel.UNACCESSIBLE) {
    return (
      <LockedIcon color="red">You do not have access to this study.</LockedIcon>
    );
  }
  return <React.Fragment />;
};
