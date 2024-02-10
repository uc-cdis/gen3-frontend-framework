import {
  Accessibility,
  type GuppyDownloadActionFunctionParams,
  hideModal,
  Modals,
  showModal,
  useCoreDispatch,
} from '@gen3/core';
import { Dispatch, SetStateAction, useRef, useMemo, useState } from 'react';
import { downloadToFileAction } from './buttonActions';
import { Button, Loader, Tooltip } from '@mantine/core';
import { FiDownload } from 'react-icons/fi';
import { useDeepCompareCallback } from 'use-deep-compare';
import { partial } from 'lodash';
import { cleanNotifications, showNotification } from '@mantine/notifications';
import { DownloadNotification } from '../../utils/download';
import { useCallback } from 'react';

type ActionButtonFunction = (
  done?: () => void,
  onError?: (error: Error) => void,
  onAbort?: () => void,
  signal?: AbortSignal,
) => void;

interface GuppyActionButtonProps {
  disabled?: boolean;
  inactiveText: string;
  activeText: string;
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
  done?: () => void;
  actionFunction: ActionButtonFunction;
  customErrorMessage?: string;
  hideNotification?: boolean;
}

const GuppyActionButton = ({
  active,
  activeText,
  inactiveText,
  customStyle,
  showLoading = true,
  showIcon = true,
  preventClickEvent = false,
  onClick,
  setActive,
  disabled = false,
  Modal403 = Modals.NoAccessModal,
  Modal400 = Modals.GeneralErrorModal,
  toolTip,
  done,
  customErrorMessage,
  hideNotification = false,
  actionFunction,
}: GuppyActionButtonProps) => {
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

  const showDownloadNotification = useCallback((controller: AbortController) => {
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
  }, [done, hideNotification] );

  const Icon = active ? (
    <Loader size="sm" className="p-1" />
  ) : (
    <FiDownload title="download" size={16} />
  );
  return (
    <Tooltip disabled={!toolTip} label={toolTip}>
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
        onClick={() => {
          if (!preventClickEvent && onClick) {
            onClick();
            return;
          }
          const controller =  new AbortController();

          showDownloadNotification(controller);
          dispatch(hideModal());
          setActive && setActive(true);
          actionFunction(
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

interface DownloadToFileButtonProps extends GuppyDownloadActionFunctionParams {
  activeText: string;
  inactiveText: string;
  tooltipText: string;
  rootPath?: string;
}

export const DownloadToFileButton = ({
  type,
  filename,
  filter,
  fields,
  accessibility,
  activeText = 'Downloading...',
  inactiveText = 'Download',
  tooltipText = 'Download data',
  rootPath = undefined,
}: GuppyDownloadActionFunctionParams) => {
  const [downloading, setDownloading] = useState(false);

  return (
    <GuppyActionButton
      activeText={activeText}
      inactiveText={inactiveText}
      active={downloading}
      setActive={setDownloading}
      actionFunction={partial(downloadToFileAction, {
        type: type,
        filename: filename,
        filter: filter,
        fields: fields,
        format: 'json',
        rootPath: rootPath,
        ...{ accessibility: accessibility || Accessibility.ALL },
      })}
      toolTip={tooltipText}
    />
  );
};
