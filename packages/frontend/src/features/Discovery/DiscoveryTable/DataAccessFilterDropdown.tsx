import React, { useState } from 'react';
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
  MdOutlineWatchLater,
  MdOutlineLockOpen,
  MdOutlineLock,
} from 'react-icons/md';
import { AiOutlineDash } from 'react-icons/ai';
import { LuFilter } from 'react-icons/lu';

interface DataAccessFilterDropdownProps {
  /*
  onClose: () => void;
  permalink: string;
  showSubmitButton?: boolean;
  */
}
const DataAccessFilterDropdown: React.FC<
  DataAccessFilterDropdownProps
> = ({}) => {
  const [opened, setOpened] = useState(false);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Popover
        opened={opened}
        onChange={setOpened}
        width={250}
        position="bottom"
        withArrow
        shadow="md"
      >
        <Popover.Target>
          <UnstyledButton
            className="pt-0.5 px-3 ml-1 hover:bg-gray-300/50 rounded transition-colors"
            onClick={() => setOpened((o) => !o)}
          >
            <LuFilter size={18} />
          </UnstyledButton>
        </Popover.Target>
        <Popover.Dropdown className="p-0 ">
          <Stack gap={0} className="py-2">
            <div className="flex items-center gap-3 px-4 py-2">
              <Checkbox defaultChecked radius="xs" />
              <MdOutlineWatchLater className="text-xl" />
              <Text size="sm">Waiting</Text>
            </div>
            <div className="flex items-center gap-3 px-4 py-2">
              <Checkbox defaultChecked radius="xs" />
              <MdOutlineLockOpen className="text-xl" />
              <Text size="sm">Available</Text>
            </div>
            <div className="flex items-center gap-3 px-4 py-2">
              <Checkbox defaultChecked radius="xs" />
              <MdOutlineLock className="text-xl" />
              <Text size="sm">Request Access</Text>
            </div>
            <div className="flex items-center gap-3 px-4 py-2">
              <Checkbox defaultChecked radius="xs" />
              <AiOutlineDash className="text-xl" />
              <Text size="sm">Not Available</Text>
            </div>
          </Stack>
          <div className="border-t border-gray-100 p-3">
            <Group grow gap="sm">
              <Button
                variant="outline"
                size="xs"
                onClick={() => setOpened(false)}
              >
                OK
              </Button>
              <Button size="xs">Reset</Button>
            </Group>
          </div>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
};
export default DataAccessFilterDropdown;
