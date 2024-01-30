import { hideModal, useCoreDispatch, CoreDispatch } from '@gen3/core';
import { Button, Modal } from '@mantine/core';
import { ReactNode } from 'react';

interface ButtonOptions {
  onClick?: () => void;
  hideModalOnClick?: boolean;
  title: string;
  dataTestId: string;
}

const isButtonOptions = (
  button: ButtonOptions | JSX.Element,
): button is ButtonOptions => {
  return typeof button === 'object' && 'title' in button;
};

const renderButtons = (
  buttons: Array<ButtonOptions | JSX.Element>,
  dispatch: CoreDispatch,
): JSX.Element => {
  return (
    <div className="flex justify-end mt-2.5 gap-2">
      {buttons.map((button) => {
        if (isButtonOptions(button)) {
          const { onClick, title, hideModalOnClick, dataTestId } = button;

          return (
            <Button
              data-testid={dataTestId}
              key={title}
              onClick={() => {
                if (onClick) {
                  onClick();

                  if (hideModalOnClick) {
                     dispatch(hideModal());
                  }
                } else {
                   dispatch(hideModal());
                }
              }}
              className="!bg-primary hover:!bg-primary-darker"
            >
              {title}
            </Button>
          );
        } else return button;
      })}
    </div>
  );
};

interface Props {
  openModal: boolean;
  title: ReactNode;
  size?: string | number;
  children: ReactNode;
  leftButtons?: Array<ButtonOptions | JSX.Element>;
  buttons?: Array<ButtonOptions | JSX.Element>;
  withCloseButton?: boolean;
  onClose?: () => void;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
}

export const BaseModal= ({
  openModal,
  title,
  size,
  children,
  leftButtons,
  buttons,
  withCloseButton,
  onClose,
  closeOnClickOutside,
  closeOnEscape,
}: Props) => {
  const dispatch = useCoreDispatch();
  return (
    <Modal
      opened={openModal}
      title={title}
      zIndex={400}
      onClose={() => {
        dispatch(hideModal());
        if (onClose) {
          onClose();
        }
      }}
      styles={() => ({
        header: {
          marginBottom: '5px',
        },
        close: {
          color: 'base-darker',
        },
      })}
      withinPortal={false}
      withCloseButton={withCloseButton ?? true}
      closeOnClickOutside={closeOnClickOutside ?? true}
      closeOnEscape={closeOnEscape ?? true}
      size={size && size}
    >
      {children}
      <div className="flex justify-between items-center">
      {leftButtons && renderButtons(leftButtons, dispatch)}
      {buttons && renderButtons(buttons, dispatch)}
      </div>
    </Modal>
  );
};
