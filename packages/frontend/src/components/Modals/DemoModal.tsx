import React from 'react';
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Group } from '@mantine/core';

// Example modal using mantine components and hooks only
function DemoModal() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <React.Fragment>
      <Modal opened={opened} onClose={close} title="Authentication">
        <div className="!bg-red-400 !w-100 !h32">Hello world</div>
      </Modal>
      <div className="bg-red-400 w-26 h-32"> Content </div>
      <Group position="center">
        <Button variant="outline" onClick={open}>
          Open modal
        </Button>
      </Group>
    </React.Fragment>
  );
}

export default DemoModal;
