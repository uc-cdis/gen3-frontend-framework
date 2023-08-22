'use client';
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Group } from '@mantine/core';

const Content = () => (
  <div className="bg-red-400 w-100 h-32">
    Hello world
  </div>
);

function DemoModal() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Authentication">
        <div className="bg-red-400 w-100 h-32">
          Hello world
        </div>
      <Content />
      </Modal>

      <div className="bg-red-400 w-26 h-32"> Content </div>
      <Group position="center">
        <Button variant="outline" onClick={open}>Open modal</Button>
      </Group>
    </>
  );
}

export default DemoModal;
