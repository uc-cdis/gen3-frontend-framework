import React, { useState } from 'react';
import {
  Button,
  Checkbox,
  Group,
  Popover,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { LuFilter as FilterIcon } from 'react-icons/lu';
import { useDiscoveryContext } from '../DiscoveryProvider';
import { AccessLevel } from '../../../utils';
import { Icon } from '@iconify-icon/react';

const DataAccessFilterDropdown = () => {
  const [opened, setOpened] = useState(false);
  const { selectedAccessLevels, setSelectedAccessLevels } =
    useDiscoveryContext();
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
    setDraftAccessLevels([]);
    setSelectedAccessLevels([]);
    setOpened(false);
  };

  const items = [
    {
      level: AccessLevel.WAITING,
      label: 'Waiting',
      icon: <Icon icon="gen3:clock" width="1.5rem" height="1.5rem" />,
    },
    {
      level: AccessLevel.ACCESSIBLE,
      label: 'Available',
      icon: <Icon icon="gen3:lock-open" width="1.5rem" height="1.5rem" />,
    },
    {
      level: AccessLevel.UNACCESSIBLE,
      label: 'Request Access',
      icon: <Icon icon="gen3:lock-outline" width="1.5rem" height="1.5rem" />,
    },
    {
      level: AccessLevel.NOT_AVAILABLE,
      label: 'Not Available',
      icon: <Icon icon="gen3:dash-outlined" width="1.5rem" height="1.5rem" />,
    },
  ];

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
              selectedAccessLevels.length > 0
                ? 'var(--mantine-color-accent-5)'
                : 'gray'
            }
          />
        </UnstyledButton>
      </Popover.Target>

      <Popover.Dropdown className="p-0">
        <Stack gap={0} className="py-2">
          {items.map((item) => (
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
