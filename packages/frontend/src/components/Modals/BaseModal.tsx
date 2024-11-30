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

/**
 * Creates a generalized modal that can be used for a wide variety of purposes.
 * @param buttons - Mantine button options
 * @param dispatch - Dispatch hook to be used for state tracking
 */
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

/**
 * Creates a generalized modal that can be used for a wide variety of purposes.
 * @param openModal - Determines whether modal/drawer is opened
 * @param title - Modal title
 * @param size - Controls width of the content area, 'md' by default
 * @param children - Modal content
 * @param leftButtons - Mantine button component args for renderButtons component
 * @param buttons - Mantine button component args for renderButtons component
 * @param withCloseButton - Determines whether the close button should be rendered, true by default
 * @param onClose - Called when modal/drawer is closed
 * @param closeOnClickOutside - Determines whether the modal/drawer should be closed when user clicks on the overlay, true by default
 * @param closeOnEscape - Determines whether onClose should be called when user presses the escape key, true by default
 * @see https://mantine.dev/core/modal/
 * @returns a mantine modal with a built in button for closing the modal
 */
export const BaseModal = ({
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
      classNames={{
        header:
          'font-medium font-heading pb-2.5 mb-2 bg-primary text-primary-contrast',
        close: 'text-accent',
      }}
      withinPortal={false}
      withCloseButton={withCloseButton ?? true}
      closeOnClickOutside={closeOnClickOutside ?? true}
      closeOnEscape={closeOnEscape ?? true}
      size={size}
    >
      {children}
      <div className="flex justify-between items-center">
        {leftButtons && renderButtons(leftButtons, dispatch)}
        {buttons && renderButtons(buttons, dispatch)}
      </div>
    </Modal>
  );
};
