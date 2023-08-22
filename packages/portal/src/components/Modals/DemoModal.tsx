import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Group } from '@mantine/core';

function DemoModal() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Authentication">
        <div className="bg-gen3-primary w-100 h32">
          Hello world
        </div>
      </Modal>

      <Group position="center">
        <Button variant="outline" onClick={open}>Open modal</Button>
      </Group>
    </>
  );
}

export default DemoModal;
