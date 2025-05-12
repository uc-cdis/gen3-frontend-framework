import React from 'react';
import { IconButton } from './IconButton';
import { TopIconButtonConfig } from './types';
import { Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';

export type ModalButtonPros = Omit<TopIconButtonConfig, 'type'>;

const ShowModalButton = ({
  name,
  leftIcon,
  rightIcon,
  tooltip,
  modal,
  iconSize,
  classNames = {},
}: ModalButtonPros) => {
  return (
    <Tooltip label={tooltip}>
      <IconButton
        name={name}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        iconSize={iconSize}
        classNames={classNames}
        clickHandler={() => {
          console.log('open ', modal);
          modals.openContextModal({
            modal: modal ?? 'default',
            title: 'Jobs',
            innerProps: {
              modalBody:
                'This modal was defined in ModalsProvider, you can open it anywhere in you app with useModals hook',
            },
          });
        }}
      ></IconButton>
    </Tooltip>
  );
};

export default ShowModalButton;
