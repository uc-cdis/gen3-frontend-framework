import React, { Dispatch, SetStateAction, forwardRef } from 'react';
import { Button, ButtonProps, Loader, Tooltip } from '@mantine/core';
import { FiDownload } from 'react-icons/fi';
import download from '../../../utils/download';
import { hideModal, Modals, useCoreDispatch } from '@gen3/core';

/**
 * Properties for the DownloadButton component.
 * @category Buttons
 * @property endpoint - The endpoint to download from.
 * @property disabled - Whether the button is disabled.
 * @property inactiveText - The text to display when the button is inactive.
 * @property activeText - The text to display when the button is active.
 * @property params - The parameters to pass to the endpoint.
 * @property format - The format of the download.
 * @property fields - The fields to download.
 * @property filters - The filters to download.
 * @property method - The method to use for the download.
 * @property customStyle - Any custom styles to apply to the button.
 * @property showLoading - Whether to show the loading icon.
 * @property showIcon - Whether to show the download icon.
 * @property preventClickEvent - Whether to prevent the default click event.
 * @property onClick - The function to call when the button is clicked.
 * @property setActive - The function to call when the button is set active.
 * @property active - Whether the button is active.
 * @property Modal403 - The modal to display when a 403 error occurs.
 * @property Modal400 - The modal to display when a 400 error occurs.
 * @property toolTip - The tooltip to display.
 */
interface DownloadButtonProps {
  endpoint?: string;
  disabled?: boolean;
  inactiveText: string;
  activeText: string;
  format?: string;
  params: Record<string, any>;
  method?: string;
  customStyle?: string;
  showLoading?: boolean;
  showIcon?: boolean;
  preventClickEvent?: boolean;
  onClick?: () => void;
  setActive?: Dispatch<SetStateAction<boolean>>;
  active?: boolean;
  Modal403?: Modals;
  Modal400?: Modals;
  toolTip?: string;
}

/**
 * A Button component that downloads data from a given endpoint.
 * The component will handle all download logic including fetching
 * the data, creating the file, and downloading the file.
 * @param endpoint - The endpoint to download from.
 * @param disabled - Whether the button is disabled.
 * @param inactiveText - The text to display when the button is inactive.
 * @param activeText - The text to display when the button is active.
 * @param filename - The name of the file to download.
 * @param size - The size of the download.
 * @param format - The format of the download.
 * @param fields - The fields to download.
 * @param caseFilters - The case filters to download.
 * @param filters - The filters to download.
 * @param extraParams - Any extra parameters to download.
 * @param method - The method to use for the download.
 * @param customStyle - Any custom styles to apply to the button.
 * @param showLoading - Whether to show the loading icon.
 * @param showIcon - Whether to show the download icon.
 * @param preventClickEvent - Whether to prevent the default click event.
 * @param onClick - The function to call when the button is clicked.
 * @param setActive - The function to call when the button is set active.
 * @param active - Whether the button is active.
 * @param Modal403 - The modal to display when a 403 error occurs.
 * @param Modal400 - The modal to display when a 400 error occurs.
 * @param toolTip - The tooltip to display.
 * @category Buttons
 */

export const DownloadButton = forwardRef<
  HTMLButtonElement,
  DownloadButtonProps & ButtonProps
>(
  (
    {
      endpoint = '',
      disabled = false,
      inactiveText,
      activeText,
      params = {},
      method = 'POST',
      customStyle,
      setActive,
      onClick,
      showLoading = true,
      showIcon = true,
      preventClickEvent = false,
      active,
      Modal400 = Modals.GeneralErrorModal,
      Modal403 = Modals.NoAccessModal,
      toolTip,
      ...buttonProps
    }: DownloadButtonProps,
    ref,
  ) => {
    const text = active ? activeText : inactiveText;
    const dispatch = useCoreDispatch();
    const Icon = active ? (
      <Loader size="sm" className="p-1" />
    ) : (
      <FiDownload title="download" size={16} />
    );

    return (
      <Tooltip disabled={!toolTip} label={toolTip}>
        <Button
          ref={ref}
          leftSection={showIcon && inactiveText && <FiDownload />}
          disabled={disabled}
          className={
            customStyle ||
            `text-base-lightest ${
              disabled ? 'bg-base' : 'bg-primary hover:bg-primary-darker'
            } `
          }
          loading={showLoading && active}
          onClick={() => {
            if (!preventClickEvent && onClick) {
              onClick();
              return;
            }
            dispatch(hideModal());
            if (setActive) setActive(true);
            download({
              endpoint,
              params,
              method,
              dispatch,
              done: () => {
                if (setActive) setActive(false);
              },
              Modal400,
              Modal403,
            });
          }}
          {...buttonProps}
        >
          {text || Icon}
        </Button>
      </Tooltip>
    );
  },
);

DownloadButton.displayName = 'DownloadButton';
