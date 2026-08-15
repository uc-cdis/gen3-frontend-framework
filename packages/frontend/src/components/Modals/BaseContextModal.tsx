import React, { ReactNode, JSX } from 'react';
import { ContextModalProps } from '@mantine/modals';
import { Button } from '@mantine/core';

interface ButtonOptions {
  onClick?: () => void;
  hideModalOnClick?: boolean;
  title: string;
  dataTestId: string;
}

const isNonNullRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isButtonOptions = (button: unknown): button is ButtonOptions => {
  if (!isNonNullRecord(button)) return false;
  return !!(typeof button === 'object' && 'title' in button && button?.title);
};

export interface BaseContextModalProps {
  contents: ReactNode;
  buttons?: Array<ButtonOptions | JSX.Element>;
}

/**
 * A Base model for use in mantine's context modals.
 * @param context
 * @param id
 * @param innerProps
 * @constructor
 */
const BaseContextModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<BaseContextModalProps>) => {
  const { contents, buttons } = innerProps;
  return (
    <>
      {contents}
      {buttons && (
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
                        context.closeModal(id);
                      }
                    } else {
                      context.closeModal(id);
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
      )}
    </>
  );
};

export default BaseContextModal;
