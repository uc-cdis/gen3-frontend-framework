import React, { ReactNode, forwardRef } from 'react';
import { Button, ButtonProps, Tooltip, Loader } from '@mantine/core';
import { FiDownload as DownloadIcon } from 'react-icons/fi';

export interface CartActionButtonProps {
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  toolTip?: string;
  active?: boolean;
  showIcon?: boolean;
  onClick?: (items: Record<string, any> | Array<any>) => void;
}

const CartActionButton = forwardRef<
  HTMLButtonElement,
  CartActionButtonProps & ButtonProps
>(
  ({
    label,
    icon = undefined,
    disabled = false,
    toolTip = undefined,
    onClick = () => null,
    active = false,
    showIcon = true,
    ...buttonProps
  }: CartActionButtonProps) => {
    const Icon = active ? (
      <Loader size="sm" className="p-1" />
    ) : (
      <DownloadIcon title="download" size={16} />
    );

    return (
      <Tooltip disabled={!toolTip} label={toolTip}>
        <Button
          leftIcon={showIcon ? icon ?? <DownloadIcon /> : undefined}
          onClick={onClick}
          disabled={disabled}
          {...buttonProps}
        >
          {label || Icon}
        </Button>
      </Tooltip>
    );
  },
);

CartActionButton.displayName = 'CartActionButton';

export default CartActionButton;
