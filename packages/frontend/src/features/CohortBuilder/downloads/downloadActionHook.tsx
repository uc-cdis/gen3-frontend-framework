import { useState, useRef, useCallback } from 'react';
import { hideModal, Modals, showModal, useCoreDispatch } from '@gen3/core';
import { GuppyActionButtonProps } from '../types';
import { cleanNotifications, showNotification } from '@mantine/notifications';
import { DownloadNotification } from '../../../utils/download';
import { Loader } from '@mantine/core';
import { FiDownload } from 'react-icons/fi';
import { useDeepCompareCallback } from 'use-deep-compare';

interface GuppyDownloadActionHookProps extends Pick<
  GuppyActionButtonProps,
  | 'Modal403'
  | 'Modal400'
  | 'done'
  | 'customErrorMessage'
  | 'hideNotification'
  | 'actionFunction'
  | 'actionArgs'
> {
  setIsActive?: (active: boolean) => void;
}

const useGuppyActionButton = ({
  Modal403 = Modals.NoAccessModal,
  Modal400 = Modals.GeneralErrorModal,
  done,
  customErrorMessage,
  hideNotification = false,
  actionFunction,
  actionArgs,
  setIsActive = (_:boolean) => null,
}: GuppyDownloadActionHookProps) => {
  const [active, setActive] = useState(false);
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
        autoClose: false,
      });
    },
    [done, hideNotification],
  );

  const handleClick = async () => {

    const controller = new AbortController();

    showDownloadNotification(controller);
    setActive(true);
    setIsActive && setIsActive(true);
    await actionFunction(
      actionArgs,
      () => {
        setActive(false);
        setIsActive && setIsActive(false);
        // Clean up notifications...
      },
      (error) => {
        handleError(error);
        setActive(false);
        setIsActive && setIsActive(false);
        // Clean up notifications...
      },
      () => {
        setActive(false);
        setIsActive && setIsActive(false);
        // Clean up notifications...
      },
      controller.signal,
    );
  };

  const icon = active ? (
    <Loader size="sm" className="p-1" />
  ) : (
    <FiDownload title="download" size={16} />
  );

  return {
    handleClick,
    icon,
    active
  };
};

export default useGuppyActionButton;
