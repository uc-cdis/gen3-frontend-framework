import React from 'react';
import type { CellRenderFunctionProps } from './types';
import { AccessLevel } from '../../../../utils';
import { Divider, Group, Text, Tooltip } from '@mantine/core';
import { AiOutlineDash as NotAvailableIcon } from 'react-icons/ai';
import { getAccessLevelFromNumber } from '../../utils';
import { isArray } from 'lodash';
import { useDiscoveryContext } from '../../DiscoveryProvider';
import { Icon } from '@iconify-icon/react';

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
  // oxlint-disable-next-line typescript/no-unnecessary-condition
  const authorization = (row?.original?.[authzField] as string) || undefined;
  const dataObjectField =
    config.features.exportFromDiscovery?.exportDataFields.dataObjectField ??
    'not_set';
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
        <NotAvailableIcon
          className="text-utility-error"
          width="1.5rem"
          height="1.5rem"
        />
      </Tooltip>
    );
  }
  if (!accessLevel) {
    return (
      <Tooltip label={buildTooltip('Unable to determine access level')}>
        <NotAvailableIcon
          className="text-utility-error"
          width="1.5rem"
          height="1.5rem"
        />
      </Tooltip>
    );
  }

  if (accessLevel === AccessLevel.WAITING) {
    return (
      <Tooltip label={buildTooltip('Data are not yet available')}>
        <Icon
          icon="gen3:clock"
          className="text-utility-warning"
          width="1.5rem"
          height="1.5rem"
        />
      </Tooltip>
    );
  }
  if (accessLevel === AccessLevel.MIXED) {
    return (
      <Tooltip label={buildTooltip('You have mixed access')}>
        <Group>
          <Icon
            icon="gen3:lock-outline"
            className="text-utility-warning"
            width="1.5rem"
            height="1.5rem"
          />
          <Icon
            icon="gen3:lock-open"
            className="text-utility-warning"
            width="1.5rem"
            height="1.5rem"
          />
        </Group>
      </Tooltip>
    );
  }
  if (accessLevel === AccessLevel.OTHER) {
    return (
      <Tooltip label={buildTooltip('Access level is other')}>
        <Group>
          <Icon
            icon="gen3:folder-lock"
            className="text-utility-warning"
            width="1.5rem"
            height="1.5rem"
          />
        </Group>
      </Tooltip>
    );
  }
  if (accessLevel === AccessLevel.NOT_AVAILABLE) {
    return (
      <Tooltip label={buildTooltip('No data is shared')}>
        <NotAvailableIcon
          className="text-utility-error"
          width="1.5rem"
          height="1.5rem"
        />
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
          <Icon
            icon="gen3:lock-open"
            className="text-utility-success"
            width="1.5rem"
            height="1.5rem"
          />
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
          <Icon
            icon="gen3:lock-outline"
            className="text-utility-error"
            width="1.5rem"
            height="1.5rem"
          />
        </div>
      </Tooltip>
    );
  }
  return <React.Fragment />;
};
