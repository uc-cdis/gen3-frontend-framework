import React from 'react';
import type { NameAndIcon } from '../types';
import { mergeDefaultTailwindClassnames } from '../../../utils/mergeDefaultTailwindClassnames';
import { focusStyles } from '../../../utils/focusStyle';
import { IconSize } from '../../DataLibrary/types';
import { extractClassName } from '../utils';
import { Icon } from '@iconify-icon/react';
import { Tooltip } from '@mantine/core';
import { TooltipStyle } from '../style';

export interface TopIconButtonProps extends NameAndIcon {
  tooltip?: string;
  clickHandler?: () => void;
  ariaLabel?: string;
  component?: React.ReactElement;
}

export interface TopIconButtonPropsWithLink extends TopIconButtonProps {
  href: string;
  newWindow?: boolean;
}

export interface TopIconButtonPropsWithModal extends TopIconButtonProps {
  modal?: string;
}

export const IconButton = ({
  name,
  leftIcon = undefined,
  rightIcon = undefined,
  iconSize = 'md',
  tooltip = undefined,
  classNames = {},
  clickHandler = undefined,
  ariaLabel = undefined,
}: TopIconButtonProps) => {
  const classNamesDefaults = {
    root: `flex items-center align-middle px-2 my-2`,
    button: `flex flex-nowrap items-center align-middle border-b-2 hover:border-accent border-transparent ${focusStyles}`,
    leftIcon: 'text-secondary-contrast-lighter pr-1',
    label: 'font-content text-secondary-contrast-lighter block',
    rightIcon: 'text-secondary-contrast-lighter pl-1',
  };
  const mergedClassnames = mergeDefaultTailwindClassnames(
    classNamesDefaults,
    classNames,
  );

  // get the icon size otherwise use the value of iconsSize as a string value: e.g. 2em
  const iconSz = IconSize[iconSize] ?? iconSize;

  // the icons are decorative: the label, ariaLabel or tooltip names the button
  const content = (
    <>
      {leftIcon ? (
        <Icon
          icon={leftIcon}
          width={iconSz}
          height={iconSz}
          aria-hidden="true"
          className={extractClassName('leftIcon', mergedClassnames)}
        />
      ) : null}
      <span className={extractClassName('label', mergedClassnames)}>
        {name}
      </span>
      {rightIcon && rightIcon.length > 0 ? (
        <Icon
          width={iconSz}
          height={iconSz}
          icon={rightIcon}
          aria-hidden="true"
          className={extractClassName('rightIcon', mergedClassnames)}
        />
      ) : null}
    </>
  );

  return (
    <div className={extractClassName('root', mergedClassnames)}>
      <Tooltip
        label={tooltip}
        position="bottom"
        withArrow
        multiline
        color="base"
        disabled={tooltip === undefined}
        classNames={TooltipStyle}
      >
        {clickHandler ? (
          <button
            type="button"
            className={extractClassName('button', mergedClassnames)}
            // only override the visible label when asked to, or when there is no
            // visible text to name the button
            aria-label={ariaLabel ?? (name ? undefined : tooltip)}
            onClick={() => clickHandler()}
          >
            {content}
          </button>
        ) : (
          // without a click handler this is not an interactive control: rendering
          // a button here would nest a control inside the wrapping link or button
          <span className={extractClassName('button', mergedClassnames)}>
            {content}
          </span>
        )}
      </Tooltip>
    </div>
  );
};
