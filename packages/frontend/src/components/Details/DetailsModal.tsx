import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';
import { DetailsComponentProps, DetailsPanelComponentProps } from './types';
import { useEffect } from 'react';

export const DetailsModal = <
  T extends DetailsPanelComponentProps = DetailsPanelComponentProps,
>({
  title,
  id,
  classNames,
  panel,
  panelProps,
  onClose,
  withCloseButton = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
}: DetailsComponentProps<T>) => {
  const [opened, { open, close }] = useDisclosure(id !== undefined);

  useEffect(() => {
    if (id !== undefined) open();
    else close();
  }, [close, id, open]);

  return (
    <Modal
      opened={opened}
      onClose={() => {
        close();
        onClose && onClose(id);
      }}
      title={title}
      withinPortal={false}
      withCloseButton={withCloseButton}
      closeOnClickOutside={closeOnClickOutside}
      closeOnEscape={closeOnEscape}
      size="auto"
    >
      {panel({ id: id, ...panelProps })}
    </Modal>
  );
};

export default DetailsModal;
