import {
  Accessibility,
  type  GuppyDownloadActionFunctionParams,
  hideModal,
  Modals,
  showModal,
  useCoreDispatch,
} from '@gen3/core';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { downloadToFileAction } from './buttonActions';
import { Button, Loader, Tooltip } from '@mantine/core';
import { FiDownload } from 'react-icons/fi';
import { useDeepCompareCallback } from 'use-deep-compare';
import { partial } from 'lodash';

type ActionButtonFunction = (
  done?: () => void,
  onError?: (error: Error) => void) => void;


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
  actionFunction: ActionButtonFunction;
  customErrorMessage?: string;
}


const GuppyActionButton = (
  {
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
    customErrorMessage,
    actionFunction,
  }: GuppyActionButtonProps,
) => {
  const text = active ? activeText : inactiveText;
  const ref = useRef(null);
  const dispatch = useCoreDispatch();


  const handleError = useDeepCompareCallback((error: Error) => {
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
  }, [Modal400, Modal403, customErrorMessage, dispatch]);


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
          dispatch(hideModal());
          setActive && setActive(true);
          actionFunction(
            () => setActive && setActive(false),
            (error: Error) => {
              handleError(error);
              setActive && setActive(false);
            });
        }}
      >
        {text || Icon}
      </Button>
    </Tooltip>
  );
};


export const DownloadToFileButton = ({
                                       type,
                                       filename,
                                       filter,
                                       fields,
                                       accessibility,
                                     }: GuppyDownloadActionFunctionParams) => {
  const [downloading, setDownloading] = useState(false);

  return (
    <GuppyActionButton
      activeText="Downloading..."
      inactiveText="Download JSON to file"
      active={downloading}
      setActive={setDownloading}
      actionFunction={partial(downloadToFileAction, {
        type: type,
        filename: filename,
        filter: filter,
        fields: fields,
        format: 'json',
        rootPath: "gen3_discovery",
        ...{ accessibility: accessibility || Accessibility.ALL },
      })}
      toolTip="Download JSON to file"
    />
  );

};
