import React, { ReactNode, forwardRef } from 'react';
import { Button, ButtonProps, Tooltip, Loader } from '@mantine/core';
import { FiDownload as DownloadIcon } from 'react-icons/fi';
import { useIsUserLoggedIn } from "@gen3/core";

export interface CartActionButtonProps {
  label?: string;
  icon?: ReactNode;
  disabled?: boolean;
  toolTip?: string;
  active?: boolean;
  showIcon?: boolean;
  loginRequired?: boolean;
  onClick?: (items: Record<string, any> | Array<any>) => void;
}

const CartActionButton: React.FC<CartActionButtonProps & ButtonProps> = ({
  label = undefined,
  icon = undefined,
  disabled = false,
  toolTip = undefined,
  onClick = () => null,
  active = false,
  showIcon = true,
  loginRequired = false,
  ...buttonProps
}: CartActionButtonProps & ButtonProps) => {

  const needLogin = !useIsUserLoggedIn() && loginRequired;

   const buttonUcon = active ? (
     <Loader size="sm" className="p-1" />
   ) : ( <DownloadIcon title="download" size={16} />);


 // const icon = needLogin ? <DownloadIcon /> : undefined;
  return (
    <Tooltip disabled={!toolTip} label={toolTip}>
      <Button
        onClick={onClick}
        disabled={disabled || needLogin }
        leftIcon={showIcon ? buttonUcon : undefined}
        {...buttonProps}
      >
        {label}
      </Button>
    </Tooltip>
  );
};

CartActionButton.displayName = 'CartActionButton';

export default CartActionButton;
