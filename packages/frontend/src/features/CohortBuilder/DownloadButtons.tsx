import { hideModal, Modals, showModal, useCoreDispatch } from '@gen3/core';
import { useCallback, useRef, useState } from 'react';
import { Button, Loader, Tooltip } from '@mantine/core';
import { FiDownload } from 'react-icons/fi';
import { useDeepCompareCallback } from 'use-deep-compare';
import { cleanNotifications, showNotification } from '@mantine/notifications';
import { DownloadNotification } from '../../utils/download';
import { GuppyActionButtonProps } from './types';

export const GuppyActionButton = ({
  activeText,
  inactiveText,
  customStyle,
  showLoading = true,
  showIcon = true,
  preventClickEvent = false,
  onClick,
  disabled = false,
  Modal403 = Modals.NoAccessModal,
  Modal400 = Modals.GeneralErrorModal,
  tooltipText,
  done,
  customErrorMessage,
  hideNotification = false,
  actionFunction,
  actionArgs,
}: GuppyActionButtonProps) => {
  const [active, setActive] = useState(false);
  const text = active ? activeText : inactiveText;
  const ref = useRef(null);
  const dispatch = useCoreDispatch();

  const handleError = useDeepCompareCallback(
    (error: Error) => {
      const errorMessage: string = error.message;
      if (
        errorMessage === 'internal server error' ||
        errorMessage === undefined
      ) {
        dispatch(showModal({ modal: Modal400, message: errorMessage }));
      } else if (
        errorMessage ===
        'Your token is invalid or expired. Please get a new token.'
      ) {
        dispatch(showModal({ modal: Modal403, message: errorMessage }));
      } else {
        dispatch(
          showModal({
            modal: Modal400,
            message: customErrorMessage || errorMessage,
          }),
        );
      }
    },
    [Modal400, Modal403, customErrorMessage, dispatch],
  );

  const showDownloadNotification = useCallback(
    (controller: AbortController) => {
      showNotification({
        message: (
          <DownloadNotification
            onClick={() => {
              controller.abort();
              cleanNotifications();
              if (done) {
                done();
              }
            }}
          />
        ),
        styles: () => ({
          root: {
            textAlign: 'center',
            display: hideNotification ? 'none' : 'block',
          },
          closeButton: {
            color: 'black',
            '&:hover': {
              backgroundColor: 'lightslategray',
            },
          },
        }),
        closeButtonProps: { 'aria-label': 'Close notification' },
      });
    },
    [done, hideNotification],
  );

  const Icon = active ? (
    <Loader size="sm" className="p-1" />
  ) : (
    <FiDownload title="download" size={16} />
  );
  return (
    <Tooltip disabled={!tooltipText} label={tooltipText}>
      <Button
        ref={ref}
        leftIcon={showIcon && inactiveText && <FiDownload />}
        disabled={disabled}
        className={
          customStyle ||
          `text-base-lightest ${
            disabled ? 'bg-base' : 'bg-primary hover:bg-primary-darker'
          } `
        }
        loading={showLoading && active}
        onClick={async () => {
          if (!preventClickEvent && onClick) {
            onClick();
            return;
          }
          const controller = new AbortController();

          showDownloadNotification(controller);
          dispatch(hideModal());
          setActive && setActive(true);
          await actionFunction(
            actionArgs,
            () => {
              setActive && setActive(false);
              cleanNotifications();
            },
            (error: Error) => {
              handleError(error);
              setActive && setActive(false);
              cleanNotifications();
            },
            () => {
              setActive && setActive(false);
              cleanNotifications();
            },
            controller.signal,
          );
        }}
      >
        {text || Icon}
      </Button>
    </Tooltip>
  );
};
