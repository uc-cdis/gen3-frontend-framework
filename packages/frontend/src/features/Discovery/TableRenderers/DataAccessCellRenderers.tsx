import React from 'react';
import { CellRenderFunctionProps } from './types';
import { AccessLevel } from '../types';
import {
  LuClock as PendingIcon,
  LuUnlock as UnlockedIcon,
  LuLock as LockedIcon,
  LuCircleSlash as NotAvailableIcon,
} from 'react-icons/lu';

export const DataAccessCellRenderer = ({ value }: CellRenderFunctionProps) => {
  if ((value as AccessLevel) === AccessLevel.PENDING) {
    return (
      <PendingIcon color="green">You have access to this study.</PendingIcon>
    );
  }
  if ((value as AccessLevel) === AccessLevel.NOT_AVAILABLE) {
    return (
      <NotAvailableIcon color="green">
        You have access to this study.
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
      <LockedIcon color="green">You have access to this study.</LockedIcon>
    );
  }
  return <React.Fragment />;
};
