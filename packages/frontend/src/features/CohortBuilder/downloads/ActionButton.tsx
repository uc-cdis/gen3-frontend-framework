import React, { useRef } from 'react';
import { Button, Tooltip } from '@mantine/core';
import { FiDownload } from 'react-icons/fi';

interface ActionButtonProps {
  activeText: string;
  inactiveText: string;
  active: boolean;
  icon: JSX.Element;
  handleClick: () => void;
  customStyle?: string;
  showLoading?: boolean;
  showIcon?: boolean;
  disabled?: boolean;
  tooltipText?: string;
}

const ActionButton = ({
  activeText,
  inactiveText,
  active,
  icon,
  customStyle,
  showLoading = true,
  showIcon = true,
  disabled = false,
  handleClick,
  tooltipText,
}: ActionButtonProps) => {
  const ref = useRef(null);
  return (
    <Tooltip disabled={!tooltipText} label={tooltipText}>
      <Button
        ref={ref}
        leftSection={showIcon && inactiveText && <FiDownload />}
        disabled={disabled}
        className={
          customStyle ||
          `${disabled ? 'text-base-lightest' : 'text-primary-contrast'} ${
            disabled ? 'bg-base' : 'bg-primary hover:bg-primary-darker'
          } `
        }
        loading={showLoading && active}
        onClick={handleClick}
      >
        {active ? activeText : inactiveText || icon}
      </Button>
    </Tooltip>
  );
};

export default ActionButton;
