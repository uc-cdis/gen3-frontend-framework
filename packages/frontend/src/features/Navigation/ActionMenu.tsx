import React from 'react';
import { Menu, Text, Tooltip } from '@mantine/core';
import { PiDotsThreeCircleThin as DotsIcon } from 'react-icons/pi';
import Link from 'next/link';
import { TooltipStyle } from './style';
import { TopIconButtonPropsWithLink } from './TopBar/IconButton';
import { isTopBarLinkButton, TopBarItems } from './TopBar/types';
import { modals } from '@mantine/modals';

interface ActionMenuProps {
  items: TopBarItems[];
}

const ActionMenu = ({ items }: ActionMenuProps) => {
  return (
    <React.Fragment>
      <Menu>
        <Menu.Target>
          <Tooltip
            label={'Action Menu'}
            multiline
            color="base"
            classNames={TooltipStyle}
            position="bottom"
            withArrow
          >
            <button>
              <DotsIcon size={'3.15rem'} />
            </button>
          </Tooltip>
        </Menu.Target>
        <Menu.Dropdown>
          {items.map((x, index) => {
            return isTopBarLinkButton(x) ? (
              <Menu.Item key={`${x.name}-${index}`}>
                {x.newWindow === true ? (
                  <Link href={x.href} target="_blank">
                    <Text>{x.name}</Text>
                  </Link>
                ) : (
                  <Link href={x.href}>
                    <Text>{x.name}</Text>
                  </Link>
                )}
              </Menu.Item>
            ) : (
              <Menu.Item
                onClick={() =>
                  modals.openContextModal({
                    modal: x.modal,
                    innerProps: {},
                    size: 'xl',
                  })
                }
              >
                <Text>{x.name}</Text>
              </Menu.Item>
            );
          })}
        </Menu.Dropdown>
      </Menu>
    </React.Fragment>
  );
};

export default ActionMenu;
