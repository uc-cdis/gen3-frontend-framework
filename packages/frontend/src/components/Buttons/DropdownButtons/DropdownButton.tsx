import { Menu, Button, Text } from '@mantine/core';
import { type DropdownButtonsProps } from "./types";


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
