import type { ReactNode } from 'react';
import React from 'react';
import type { ButtonProps } from '@mantine/core';
import { Button, Tooltip } from '@mantine/core';
import { useIsUserLoggedIn } from '@gen3/core';

export interface ExportActionButtonProps {
  label?: string;
  icon?: ReactNode;
  disabled?: boolean;
  tooltip?: string;
  active?: boolean;
  showIcon?: boolean;
  loginRequired?: boolean;
  onClick?: (items: Record<string, any> | Array<any>) => void;
  ref?: React.RefObject<HTMLButtonElement>;
}

const DiscoveryActionButton = ({
  ref,
  label = undefined,
  icon = undefined,
  disabled = false,
  tooltip = undefined,
  onClick = () => null,
  showIcon = true,
  loginRequired = false,
  ...buttonProps
}: ExportActionButtonProps & ButtonProps) => {
  // TODO Test what idp was used to login and restrict actions to that idp or all or none
  const requiresLogin = !useIsUserLoggedIn() && loginRequired;

  return (
    <Tooltip disabled={!tooltip} label={tooltip}>
      <Button
        ref={ref}
        onClick={onClick}
        disabled={disabled || requiresLogin}
        rightSection={showIcon ? icon : undefined}
        {...buttonProps}
      >
        {label}
      </Button>
    </Tooltip>
  );
};

export default DiscoveryActionButton;
