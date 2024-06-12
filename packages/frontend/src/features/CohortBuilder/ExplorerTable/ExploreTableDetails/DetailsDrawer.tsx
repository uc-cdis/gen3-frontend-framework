import { Button, CopyButton, Drawer } from '@mantine/core';
import React, { useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { MdKeyboardDoubleArrowLeft as BackIcon } from 'react-icons/md';
import { DetailsDataHook } from './types';
import { useCohortBuilderContext } from '../../CohortBuilderProvider';
import DetailsPanel from './DetailsPanel';

interface ExplorerDetailsComponentProps {
  dataHook: DetailsDataHook;
}

const DetailsDrawer = ({ dataHook }: ExplorerDetailsComponentProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  // const { data, isLoading, isSuccess, isError } = dataHook();
  const { itemDetails } = useCohortBuilderContext();

  useEffect(() => {
    if (itemDetails && Object.keys(itemDetails).length > 0) {
      open();
    }
  }, [itemDetails, open]);

  if (!itemDetails) {
    return null;
  }

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
        <Drawer.Body>
          <DetailsPanel data={itemDetails ?? {}} />
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
};

export default DetailsDrawer;
