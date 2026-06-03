import React from 'react';
import { CellRenderFunctionProps } from './types';
import { AccessLevel } from '../../../../utils';
import { Divider, Group, Text, Tooltip } from '@mantine/core';
import {
  LuClock as PendingIcon,
  LuLock as LockedIcon,
  LuLockOpen as UnlockedIcon,
  LuFileLock as OtherIcon,
} from 'react-icons/lu';
import { AiOutlineDash as NotAvailableIcon } from 'react-icons/ai';
import { getAccessLevelFromNumber } from '../../utils';
import { isArray } from 'lodash';
import { useDiscoveryContext } from '../../DiscoveryProvider';

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

export const DataAccessCellRenderer = ({
  cell,
  row,
}: CellRenderFunctionProps) => {
  const { discoveryConfig: config } = useDiscoveryContext();
  const authzField = config.minimalFieldMapping?.authzField || 'authz';
  let value = cell?.getValue<number>();
  const authorization = (row?.original?.[authzField] as string) || undefined;
  const dataObjectField =
    config.features.exportFromDiscovery?.exportDataFields.dataObjectField;
  if (isArray(value)) value = value[0];
  const accessLevel = getAccessLevelFromNumber(value);
  const numFileObjects =
    dataObjectField && row?.original?.[dataObjectField]
      ? row?.original?.[dataObjectField]
      : 0;

  // Fallback approach for when accessLevel is not defined by Proxy API
  if (numFileObjects === 0 && accessLevel === undefined) {
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
  if (accessLevel === AccessLevel.OTHER) {
    alert('found an other');
    return (
      <Tooltip label={buildTooltip('Acccess level is other')}>
        <Group>
          <OtherIcon className="text-utility-warning"></OtherIcon>
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
    const authorizationInfo = authorization
      ? `read access to ${authorization}`
      : null;

    return (
      <Tooltip
        label={buildTooltip(
          'You have access to this study',
          authorizationInfo as string,
        )}
      >
        <div>
          <UnlockedIcon className="text-utility-success"></UnlockedIcon>
        </div>
      </Tooltip>
    );
  }
  if (accessLevel === AccessLevel.UNACCESSIBLE) {
    const authorizationInfo = authorization
      ? `you need read access to ${authorization}`
      : null;
    return (
      <Tooltip
        label={buildTooltip(
          'You currently do not have access to this study',
          authorizationInfo as string,
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
