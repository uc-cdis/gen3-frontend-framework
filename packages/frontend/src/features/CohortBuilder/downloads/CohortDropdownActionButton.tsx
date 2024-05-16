import { Button, Menu, MenuItemProps } from '@mantine/core';
import { FloatingPosition } from '@mantine/core/lib/Floating/types';
import { ReactNode, useState } from 'react';
import { Tooltip } from '@mantine/core';
import { IoMdArrowDropdown as Dropdown } from 'react-icons/io';
import { focusStyles } from '../../../utils';
import useGuppyActionButton from './downloadActionHook';
import { Modals } from '@gen3/core';
import { ActionButtonWithArgsFunction, GuppyActionButtonProps } from '../types';
import { useDeepCompareMemo } from 'use-deep-compare';

interface GuppyDropdownMenuItemProps
  extends Pick<
    GuppyActionButtonProps,
    | 'disabled'
    | 'Modal400'
    | 'Modal403'
    | 'done'
    | 'customErrorMessage'
    | 'hideNotification'
    | 'actionFunction'
    | 'actionArgs'
  > {
  title: string;
  idx: number;
  setIsActive?: (active: boolean) => void;
}

interface GuppyDropdownElementProps {
  title: string;
  icon?: JSX.Element;
  disabled?: boolean;
  actionFunction: ActionButtonWithArgsFunction;
  actionArgs: Record<string, any>;
}

const GuppyDropdownMenuItem = ({
  title,
  idx,
  disabled = false,
  Modal403 = Modals.NoAccessModal,
  Modal400 = Modals.GeneralErrorModal,
  done,
  setIsActive = (_: boolean) => null,
  customErrorMessage,
  hideNotification = false,
  actionFunction,
  actionArgs,
  children,
}: GuppyDropdownMenuItemProps & MenuItemProps) => {
  const { handleClick, icon } = useGuppyActionButton({
    Modal403,
    Modal400,
    done,
    customErrorMessage,
    hideNotification,
    actionFunction,
    actionArgs,
    setIsActive,
  });
  return (
    <Menu.Item
      onClick={() => {
        handleClick && handleClick();
      }}
      key={`${title}-${idx}`}
      data-testid={`${title}-${idx}`}
      icon={icon}
      disabled={disabled}
    >
      {children}
    </Menu.Item>
  );
};

interface DropdownWithIconProps {
  /**
   *    if true, doesn't set width to be "target"
   */
  disableTargetWidth?: string;
  /**
   *   Left Icon for the taret button, can be undefined too
   */
  leftIcon?: JSX.Element;
  /**
   *   Right Icon for the taret button, can be undefined too (default to dropdown icon)
   */
  rightIcon?: JSX.Element;
  /**
   *    Content for target button
   */
  TargetButtonChildren: ReactNode;
  /**
   *    array dropdown items. Need to pass title, onClick and icon event handler is optional
   */
  dropdownElements: Array<GuppyDropdownElementProps>;
  /**
   *    only provide inactiveText if we want label for dropdown elements
   */
  inactiveText?: string;
  /**
   *    label to show when menu item's action is executing
   */
  activeText?: string;
  /**
   *    custom class / styling for menuLabelText
   */
  menuLabelCustomClass?: string;
  /**
   *    custom position for Menu
   */
  customPosition?: FloatingPosition;
  /**
   *    whether the dropdown should fill the height with its parent
   */
  fullHeight?: boolean;
  /**
   *   custom z-index for Menu, defaults to undefined
   */
  zIndex?: number;
  /**
   * custom test id
   */
  customDataTestId?: string;

  /**
    tooltip
   */
  tooltip?: string;

  /**
   * aria-label for the button
   */
  buttonAriaLabel?: string;

  /**
   *    disables the target button and menu
   */
  disabled?: boolean;
}

const CohortDropdownActionButton = ({
  disableTargetWidth,
  leftIcon,
  rightIcon = (
    <Dropdown size="1.25em" aria-hidden="true" data-testid="dropdown-icon" />
  ),
  disabled = false,
  dropdownElements,
  activeText,
  inactiveText,
  customPosition,
  fullHeight,
  zIndex = undefined,
  customDataTestId = undefined,
  tooltip = undefined,
  buttonAriaLabel = undefined,
}: DropdownWithIconProps): JSX.Element => {
  const [isActive, setIsActive] = useState(false);

  const menuLabelText = useDeepCompareMemo(() => {
    return isActive ? activeText : inactiveText;
  }, [isActive, activeText, inactiveText]);

  return (
    <Menu
      width={disableTargetWidth ?? 'target'}
      {...(customPosition && { position: customPosition })}
      data-testid={customDataTestId ?? 'menu-elem'}
      zIndex={zIndex}
    >
      <Menu.Target>
        <Button
          className={`text-base-lightest data-disabled:bg-base bg-primary hover:bg-primary-darker ${focusStyles}`}
          {...(leftIcon && { leftIcon: leftIcon })}
          rightIcon={rightIcon}
          disabled={disabled}
          classNames={{
            rightIcon: 'border-l pl-1 -mr-2',
            root: fullHeight ? 'h-full' : undefined,
          }}
          aria-label={buttonAriaLabel}
          loading={isActive}
        >
          <div>
            {tooltip?.length && !disabled ? (
              <div>
                <Tooltip label={tooltip}>
                  <div>{menuLabelText}</div>
                </Tooltip>
              </div>
            ) : (
              <div>{menuLabelText}</div>
            )}
          </div>
        </Button>
      </Menu.Target>
      <Menu.Dropdown
        data-testid="dropdown-menu-options"
        className="border-1 border-secondary"
      >
        {dropdownElements?.map(
          ({ title, icon, disabled, actionFunction, actionArgs }, idx) => (
            <GuppyDropdownMenuItem
              key={`${title}-${idx}`}
              data-testid={`${title}-${idx}`}
              icon={icon && icon}
              disabled={disabled}
              title={title}
              idx={idx}
              actionFunction={actionFunction}
              actionArgs={actionArgs}
              setIsActive={setIsActive}
            >
              {title}
            </GuppyDropdownMenuItem>
          ),
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

export default CohortDropdownActionButton;
