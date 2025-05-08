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
import { useDiscoveryContext } from '../DiscoveryProvider';

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
  const { discoveryConfig: config } = useDiscoveryContext();
  const authzField = config.minimalFieldMapping?.authzField || 'authz';
  let value = cell?.getValue<number>();
  const authorization = (row?.original?.[authzField] as string) || undefined;
  const dataObjectField =
    config.features.exportFromDiscovery?.exportDataFields.dataObjectField;
  const numFileobject = row?.original?.num_fileobject || 0;
  if (isArray(value)) value = value[0];
  const accessLevel = getAccessLevelFromNumber(value);

  const numFileObjects =
    dataObjectField && row?.original?.[dataObjectField]
      ? row?.original?.[dataObjectField]
      : 0;

  if (numFileObjects === 0) {
    return (
      <Tooltip label={buildTooltip('No data attached to this study')}>
        <NotAvailableIcon className="text-utility-error"></NotAvailableIcon>
      </Tooltip>
    );
  }
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
          <LockedIcon className="text-utility-warning"></LockedIcon>
          <UnlockedIcon className="text-utility-warning"></UnlockedIcon>
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
          'You currently do not have access to this study',
          `you need read access to ${authorization}`,
        )}
      >
        <div>
          <LockedIcon className="text-utility-error"></LockedIcon>
        </div>
      </Tooltip>
    );
  }
  return <React.Fragment />;
};
