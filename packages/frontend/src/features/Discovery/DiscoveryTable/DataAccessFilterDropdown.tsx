import React, { useState, useEffect } from 'react';
import {
  Popover,
  Checkbox,
  Button,
  Stack,
  Group,
  Text,
  UnstyledButton,
} from '@mantine/core';
import {
  MdOutlineWatchLater as WaitingIcon,
  MdOutlineLockOpen as AvailableIcon,
  MdOutlineLock as RequestAccessIcon,
} from 'react-icons/md';
import { AiOutlineDash as NotAvailableIcon } from 'react-icons/ai';
import { LuFilter as FilterIcon } from 'react-icons/lu';
import { useDiscoveryContext } from '../DiscoveryProvider';
import { AccessLevel } from '../../../utils';

interface DataAccessFilterDropdownProps {}

const DataAccessFilterDropdown: React.FC<
  DataAccessFilterDropdownProps
> = ({}) => {
  const [opened, setOpened] = useState(false);
  const { selectedAccessibility, setSelectedAccessibility } =
    useDiscoveryContext();

  // Secondary data structure: Local "Draft" state
  const [draftAccessibility, setDraftAccessibility] = useState<AccessLevel[]>(
    selectedAccessibility,
  );

  // Sync draft with global state whenever the popover opens
  useEffect(() => {
    if (opened) {
      setDraftAccessibility(selectedAccessibility);
    }
  }, [opened, selectedAccessibility]);

  const handleCheckboxToggle = (level: AccessLevel) => {
    setDraftAccessibility((current) =>
      current.includes(level)
        ? current.filter((id) => id !== level)
        : [...current, level],
    );
  };

  const handleApply = () => {
    setSelectedAccessibility(draftAccessibility);
    setOpened(false);
  };

  const handleReset = () => {
    setDraftAccessibility([]);
    setOpened(false);
  };

  const items = [
    {
      level: AccessLevel.WAITING,
      label: 'Waiting',
      icon: <WaitingIcon className="text-xl" />,
    },
    {
      level: AccessLevel.ACCESSIBLE,
      label: 'Available',
      icon: <AvailableIcon className="text-xl" />,
    },
    {
      level: AccessLevel.UNACCESSIBLE,
      label: 'Request Access',
      icon: <RequestAccessIcon className="text-xl" />,
    },
    {
      level: AccessLevel.NOT_AVAILABLE,
      label: 'Not Available',
      icon: <NotAvailableIcon className="text-xl" />,
    },
  ];

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Popover
        opened={opened}
        onChange={setOpened}
        width={250}
        position="bottom"
        withArrow
        shadow="md"
        // Limit user to popover until they click OK
        closeOnClickOutside={false}
        closeOnEscape={false}
        trapFocus={true}
      >
        <Popover.Target>
          <UnstyledButton
            className="pt-0.5 px-3 ml-1 hover:bg-gray-300/50 rounded transition-colors"
            onClick={() => setOpened((o) => !o)}
          >
            <span className="sr-only">Filter</span>
            <FilterIcon size={18} />
          </UnstyledButton>
        </Popover.Target>

        <Popover.Dropdown className="p-0">
          <Stack gap={0} className="py-2">
            {items.map((item) => (
              <label
                key={item.level}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  handleCheckboxToggle(item.level);
                }}
              >
                <Checkbox
                  checked={draftAccessibility.includes(item.level)}
                  readOnly
                  radius="xs"
                  className="pointer-events-none"
                />
                <span className="text-gray-600">{item.icon}</span>
                <Text size="sm">{item.label}</Text>
              </label>
            ))}
          </Stack>

          <div className="border-t border-gray-100 p-3">
            <Group grow gap="sm">
              <Button
                variant="outline"
                size="xs"
                className="border-blue-600 text-blue-600"
                onClick={handleApply}
              >
                OK
              </Button>
              <Button
                variant="subtle"
                color="gray"
                size="xs"
                onClick={handleReset}
              >
                Reset
              </Button>
            </Group>
          </div>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
};

export default DataAccessFilterDropdown;
