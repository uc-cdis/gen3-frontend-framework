import React, { useEffect } from 'react';
import { Button, Drawer, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MdKeyboardDoubleArrowLeft as BackIcon } from 'react-icons/md';
import { DetailsComponentProps, DetailsPanelComponentProps } from './types';

const DetailsDrawer = <
  T extends DetailsPanelComponentProps = DetailsPanelComponentProps,
>({
  id,
  title,
  panel,
  panelProps,
}: DetailsComponentProps<T>) => {
  const [opened, { open, close }] = useDisclosure(id !== undefined);

  useEffect(() => {
    if (id !== undefined) open();
    else close();
  }, [close, id, open]);

  return (
    <Drawer.Root opened={opened} onClose={close} size="50%" position="right">
      <Drawer.Overlay opacity={0.5} blur={4} />
      <Drawer.Content>
        <Drawer.Header>
          <Group justify="space-between">
            <Text size="lg" fw="bolder">
              {title}
            </Text>
            <Button
              leftSection={<BackIcon />}
              onClick={close}
              variant="outline"
            >
              {' '}
              Back{' '}
            </Button>
          </Group>
        </Drawer.Header>
        <Drawer.Body>{panel({ id: id, ...panelProps })}</Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
};

export default DetailsDrawer;
