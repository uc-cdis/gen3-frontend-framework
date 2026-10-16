import React, { useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Group,
  Popover,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { LuFilter as FilterIcon } from 'react-icons/lu';
import { useDiscoveryContext } from '../DiscoveryProvider';
import { AccessLevel } from '../../../utils';
import { Icon } from '@iconify-icon/react';
import { StringToSupportedAccessLevels } from '../utils';

const DataAccessFilterDropdown = () => {
  const [opened, setOpened] = useState(false);
  const {
    selectedAccessLevels,
    setSelectedAccessLevels,
    supportedAccessLevels,
    discoveryConfig,
  } = useDiscoveryContext();

  const enabledAccessLevelsConfig = useMemo(
    () => discoveryConfig.features?.authorization?.supportedValues ?? {},
    [discoveryConfig.features?.authorization?.supportedValues],
  );

  const accessLevelItems = useMemo(
    () => [
      {
        level: AccessLevel.WAITING,
        label: enabledAccessLevelsConfig?.['waiting']?.label ?? 'Waiting',
        icon: <Icon icon="gen3:clock" width="1.5rem" height="1.5rem" />,
      },
      {
        level: AccessLevel.ACCESSIBLE,
        label: enabledAccessLevelsConfig?.['accessible']?.label ?? 'Available',
        icon: <Icon icon="gen3:lock-open" width="1.5rem" height="1.5rem" />,
      },
      {
        level: AccessLevel.UNACCESSIBLE,
        label:
          enabledAccessLevelsConfig?.['unaccessible']?.label ??
          'Not Accessible',
        icon: <Icon icon="gen3:lock-outline" width="1.5rem" height="1.5rem" />,
      },
      {
        level: AccessLevel.NOT_AVAILABLE,
        label:
          enabledAccessLevelsConfig?.['notAvailable']?.label ?? 'Not Available',
        icon: <Icon icon="gen3:dash-outlined" width="1.5rem" height="1.5rem" />,
      },
      {
        level: AccessLevel.OTHER,
        label: enabledAccessLevelsConfig?.['other']?.label ?? 'Other',
        icon: <Icon icon="gen3:dash-outlined" width="1.5rem" height="1.5rem" />,
      },
      {
        level: AccessLevel.MIXED,
        label: enabledAccessLevelsConfig?.['mixed']?.label ?? 'Mixed',
        icon: (
          <span>
            <Icon icon="gen3:lock-outline" width="1.5rem" height="1.5rem" />{' '}
            <Icon icon="gen3:lock-open" width="1.5rem" height="1.5rem" />
          </span>
        ),
      },
    ],
    [enabledAccessLevelsConfig],
  );

  // User selections before they click OK
  const [draftAccessLevels, setDraftAccessLevels] =
    useState<AccessLevel[]>(selectedAccessLevels);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setDraftAccessLevels(selectedAccessLevels);
    }
    setOpened(isOpen);
  };

  const handleCheckboxToggle = (level: AccessLevel) => {
    setDraftAccessLevels((current) =>
      current.includes(level)
        ? current.filter((id) => id !== level)
        : [...current, level],
    );
  };

  const handleApply = () => {
    setSelectedAccessLevels(draftAccessLevels);
    setOpened(false);
  };

  const handleReset = () => {
    setDraftAccessLevels(
      Object.entries(
        discoveryConfig.features.authorization?.supportedValues ?? {},
      ).reduce<number[]>((acc, [key, value]) => {
        if (value.enabled && key in StringToSupportedAccessLevels)
          acc.push(StringToSupportedAccessLevels[key]);
        return acc;
      }, []),
    );
  };

  return (
    <Popover
      opened={opened}
      onChange={handleOpenChange}
      width={250}
      position="bottom"
      withArrow
      shadow="md"
    >
      <Popover.Target>
        <Tooltip
          label={
            discoveryConfig.features.authorization?.tooltip ??
            'Filter by data access'
          }
        >
          <UnstyledButton
            className="pt-0.5 px-3 ml-1 hover:bg-gray-300/50 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenChange(!opened);
            }}
            aria-label="Filter by data access"
          >
            <FilterIcon
              size={18}
              color={
                selectedAccessLevels.length === supportedAccessLevels.size
                  ? 'var(--mantine-base-contrast-5)'
                  : 'var(--mantine-color-accent-5)'
              }
            />
          </UnstyledButton>
        </Tooltip>
      </Popover.Target>

      {/* The dropdown is portaled, but React events still bubble to the sortable header cell */}
      <Popover.Dropdown
        className="p-0"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key !== 'Escape') e.stopPropagation();
        }}
      >
        <Stack gap={0} className="py-2">
          {accessLevelItems
            .filter((item) => supportedAccessLevels.has(item.level))
            .map((item) => (
              <Checkbox
                key={item.level}
                checked={draftAccessLevels.includes(item.level)}
                onChange={() => handleCheckboxToggle(item.level)}
                radius="xs"
                label={
                  <span className="flex items-center gap-3">
                    {item.icon}
                    <Text size="sm">{item.label}</Text>
                  </span>
                }
                classNames={{
                  root: 'px-4 py-2 hover:bg-gray-50 cursor-pointer',
                  body: 'items-center',
                  labelWrapper: 'grow cursor-pointer',
                  label: 'cursor-pointer pl-0',
                }}
              />
            ))}
        </Stack>
        <div className="border-t border-gray-100 p-3">
          <Group grow gap="sm">
            <Button variant="outline" size="xs" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="filled" size="xs" onClick={handleApply}>
              OK
            </Button>
          </Group>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
};

export default DataAccessFilterDropdown;
