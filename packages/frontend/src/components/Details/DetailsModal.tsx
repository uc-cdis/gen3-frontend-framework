import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';
import { DetailsComponentProps, DetailsPanelComponentProps } from './types';
import { useEffect, useMemo } from 'react';
import { mergeDefaultTailwindClassnames } from '../../utils/mergeDefaultTailwindClassnames';

const DEFAULT_PROPS = {
  body: 'bg-base-max',
  header: '!bg-primary !pb-9 !mb-9',
  title: '!text-primary-contrast !font-bold',
  close: '!bg-base-darker',
};

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
  size = 'auto',
}: DetailsComponentProps<T>) => {
  const [opened, { open, close }] = useDisclosure(id !== undefined);

  const styling = useMemo(
    () => mergeDefaultTailwindClassnames(DEFAULT_PROPS, classNames ?? {}, true),
    [],
  );

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
      withinPortal={true}
      withCloseButton={withCloseButton}
      closeOnClickOutside={closeOnClickOutside}
      closeOnEscape={closeOnEscape}
      size={size}
      yOffset="3vh"
      classNames={styling}
      xOffset={0}
    >
      {panel({ id: id, ...panelProps })}
    </Modal>
  );
};

export default DetailsModal;
