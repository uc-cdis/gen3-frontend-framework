import React from 'react';
import { Button, Tooltip } from '@mantine/core';
import { DownloadButtonProps } from './DropdownButtons';
import { Icon } from '@iconify/react';

const ActionButton = ({
  title,
  enabled,
  type,
  leftIcon,
  rightIcon,
  tooltipText,
}: DownloadButtonProps) => {
  return (
    <Tooltip
      label={tooltipText}
      position="bottom"
      withArrow
      multiline
      disabled={tooltipText === undefined}
    >
      <Button
        color="secondary"
        disabled={enabled !== undefined ? !enabled : true}
        leftSection={leftIcon ? <Icon icon={leftIcon} /> : null}
        rightSection={rightIcon ? <Icon icon={rightIcon} /> : null}
      >
        {title}
      </Button>
    </Tooltip>
  );
};

export default ActionButton;
