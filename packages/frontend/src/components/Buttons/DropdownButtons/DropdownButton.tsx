import { Menu, Button, Text } from '@mantine/core';
import { type DropdownButtonsProps } from './types';
import { Icon } from '@iconify/react';

const DropdownButton = ({title, buttons} : DropdownButtonsProps ) : JSX.Element  => {


  return (
    <Menu>
      <Menu.Target>
        <Button color="secondary">{title}</Button>
      </Menu.Target>
      <Menu.Dropdown>
        {
          buttons.map((button) => {
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
