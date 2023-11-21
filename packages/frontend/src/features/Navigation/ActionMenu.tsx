import React from 'react';
import { Menu, Text } from '@mantine/core';
import { PiDotsThreeCircleThin as DotsIcon } from 'react-icons/pi';
import Link from 'next/link';
import { TopIconButtonProps } from './TopBar';

interface ActionMenuProps {
  items: TopIconButtonProps[];
}

const ActionMenu = ({ items }: ActionMenuProps) => {
  return (
    <>
      <Menu>
        <Menu.Target>
          <button>
            <DotsIcon size={'3.15rem'} />
          </button>
        </Menu.Target>
        <Menu.Dropdown>
          {items.map((x, index) => {
            return (
              <Menu.Item key={`${x.name}-${index}`}>
                <Link href={x.href}>
                  <Text>{x.name}</Text>
                </Link>
              </Menu.Item>
            );
          })}
        </Menu.Dropdown>
      </Menu>
    </>
  );
};

export default ActionMenu;
