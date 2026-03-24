import React, { ReactNode } from 'react';
import { Button, ButtonProps, Tooltip, Loader } from '@mantine/core';
import { FiDownload as DownloadIcon } from 'react-icons/fi';
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

const DataLibraryActionButton = (
  {
    ref,
    label = undefined,
    icon = undefined,
    disabled = false,
    tooltip = undefined,
    onClick = () => null,
    active = false,
    showIcon = true,
    loginRequired = false,
    ...buttonProps
  }: ExportActionButtonProps & ButtonProps
) => {
  // TODO Test what idp was used to login and restrict actions to that idp or all or none
  const requiresLogin = !useIsUserLoggedIn() && loginRequired;

  const buttonIcon = active ? (
    <Loader size="sm" className="p-1" />
  ) : (
    <DownloadIcon title="download" size={16} />
  );

  return (
    <Tooltip disabled={!tooltip} label={tooltip}>
      <Button
        ref={ref}
        onClick={onClick}
        disabled={disabled || requiresLogin}
        leftSection={showIcon ? buttonIcon : undefined}
        {...buttonProps}
      >
        {label}
      </Button>
    </Tooltip>
  );
};

export default DataLibraryActionButton;
