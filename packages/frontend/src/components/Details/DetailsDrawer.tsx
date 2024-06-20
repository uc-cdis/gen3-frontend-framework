import { Button, Drawer } from '@mantine/core';
import React, { cloneElement, useEffect, useMemo } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { MdKeyboardDoubleArrowLeft as BackIcon } from 'react-icons/md';
import { DetailsComponentProps } from './types';

const DetailsDrawer = ({ id, panel, panelProps }: DetailsComponentProps) => {
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
          <Button leftIcon={<BackIcon />} onClick={close} variant="outline">
            {' '}
            Back{' '}
          </Button>
        </Drawer.Header>
        <Drawer.Body>{panel({ id: id, ...panelProps })}</Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
};

export default DetailsDrawer;
