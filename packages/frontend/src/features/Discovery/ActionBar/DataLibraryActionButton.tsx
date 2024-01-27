import React, { ReactNode, forwardRef } from 'react';
import { Button, ButtonProps, Tooltip, Loader } from '@mantine/core';
import { FiDownload as DownloadIcon } from 'react-icons/fi';
import { useIsUserLoggedIn } from '@gen3/core';

export interface ExportActionButtonProps {
  label?: string;
  icon?: ReactNode;
  disabled?: boolean;
  toolTip?: string;
  active?: boolean;
  showIcon?: boolean;
  loginRequired?: boolean;
  onClick?: (items: Record<string, any> | Array<any>) => void;
}

const DataLibraryActionButton = forwardRef<
  HTMLButtonElement,
  ExportActionButtonProps & ButtonProps
>(
  (
    {
      label = undefined,
      icon = undefined,
      disabled = false,
      toolTip = undefined,
      onClick = () => null,
      active = false,
      showIcon = true,
      loginRequired = false,
      ...buttonProps
    }: ExportActionButtonProps & ButtonProps,
    ref,
  ) => {
    // TODO Test what idp was used to login and restrict actions to that idp or all or none
    const requiresLogin = !useIsUserLoggedIn() && loginRequired;

    const buttonUcon = active ? (
      <Loader size="sm" className="p-1" />
    ) : (
      <DownloadIcon title="download" size={16} />
    );

    return (
      <Tooltip disabled={!toolTip} label={toolTip}>
        <Button
          ref={ref}
          onClick={onClick}
          disabled={disabled || requiresLogin}
          leftIcon={showIcon ? buttonUcon : undefined}
          {...buttonProps}
        >
          {label}
        </Button>
      </Tooltip>
    );
  },
);

DataLibraryActionButton.displayName = 'DataLibraryActionButton';

export default DataLibraryActionButton;
