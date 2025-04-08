import React from 'react';
import { CellRenderFunctionProps } from './types';
import { AccessLevel } from '../types';
import { Divider, Group, Stack, Text, Tooltip } from '@mantine/core';
import {
  LuClock as PendingIcon,
  LuUnlock as UnlockedIcon,
  LuLock as LockedIcon,
  LuCircleSlash as NotAvailableIcon,
} from 'react-icons/lu';
import { getAccessLevelFromNumber } from '../utils';
import { JSONObject } from '@gen3/core';
import { isArray } from 'lodash';

const buildTooltip = (mainMessage: string, secondaryMessage?: string) => {
  return (
    <div className="flex flex-col">
      <Text size="sm"> {mainMessage} </Text>
      {secondaryMessage ? (
        <div className="flex flex-col items-start my-1">
          <Divider />
          <Text size="xs">{secondaryMessage}</Text>
        </div>
      ) : null}
    </div>
  );
};

export const DataAccessCellRenderer = (
  { cell, row }: CellRenderFunctionProps,
  params?: JSONObject,
) => {
  const authzField = (params?.authzField as string) || 'authz';
  let value = cell?.getValue<number>();
  const authorization = (row?.original?.[authzField] as string) || undefined;
  if (isArray(value)) value = value[0];
  const accessLevel = getAccessLevelFromNumber(value);

  if (!accessLevel) {
    return (
      <Tooltip label={buildTooltip('Unable to determine access level')}>
        <NotAvailableIcon className="text-utility-error"></NotAvailableIcon>
      </Tooltip>
    );
  }

  if (accessLevel === AccessLevel.WAITING) {
    return (
      <Tooltip label={buildTooltip('Data are not yet available')}>
        <PendingIcon className="text-utility-warning"></PendingIcon>
      </Tooltip>
    );
  }
  if (accessLevel === AccessLevel.MIXED) {
    return (
      <Tooltip label={buildTooltip('You have mixed acccess')}>
        <Group>
          <LockedIcon color="utility.3"></LockedIcon>
          <UnlockedIcon className="text-utility-success"></UnlockedIcon>
        </Group>
      </Tooltip>
    );
  }

  if (accessLevel === AccessLevel.NOT_AVAILABLE) {
    return (
      <Tooltip label={buildTooltip('No data is shared')}>
        <NotAvailableIcon className="text-utility-error"></NotAvailableIcon>
      </Tooltip>
    );
  }
  if (accessLevel === AccessLevel.ACCESSIBLE) {
    return (
      <Tooltip
        label={buildTooltip(
          'You have access to this study',
          `read access to ${authorization}`,
        )}
      >
        <div>
          <UnlockedIcon className="text-utility-success"></UnlockedIcon>
        </div>
      </Tooltip>
    );
  }
  if (accessLevel === AccessLevel.UNACCESSIBLE) {
    return (
      <Tooltip
        label={buildTooltip(
          'You have access to this study',
          `read access to ${authorization}`,
        )}
      >
        <div>
          <LockedIcon co className="text-utility-error"></LockedIcon>
        </div>
      </Tooltip>
    );
  }
  return <React.Fragment />;
};
