import { Menu, Button, Text } from '@mantine/core';
import { type DropdownButtonProps } from './types';
import { Icon } from '@iconify/react';

const DropdownButton = ({title, dropdownItems} : DropdownButtonProps ) : JSX.Element  => {
  return (
    <Menu onChange={(value) => console.log(value)}>
      <Menu.Target>
        <Button color="secondary">{title}</Button>
      </Menu.Target>
      <Menu.Dropdown>
        {
          dropdownItems.map((button) => {
            return (
              <Menu.Item key={button.title}
                         disabled={ button.enabled !== undefined ? !button.enabled : true}>
                icon={button?.leftIcon ? <Icon icon={button.leftIcon} /> : null}
                rightSection={button?.rightIcon ? <Icon icon={button.rightIcon} /> : null}
                <Text>{button.title}</Text>
              </Menu.Item>
            );
          })
        }
      </Menu.Dropdown>

    </Menu>
  );
};

export default DropdownButton;
