import React from 'react';
import { NameAndIcon } from '../types';
import { mergeDefaultTailwindClassnames } from '../../../utils/mergeDefaultTailwindClassnames';
import { IconSize } from '../../DataLibrary/types';
import { extractClassName } from '../utils';
import { Icon } from '@iconify/react';
import { Tooltip } from '@mantine/core';
import { TooltipStyle } from '../style';

export interface TopIconButtonProps extends NameAndIcon {
  tooltip?: string;
  clickHandler?: () => void;
  ariaLabel?: string;
}

export interface TopIconButtonPropsWithLink extends TopIconButtonProps {
  href: string;
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
}: Readonly<TopIconButtonProps>) => {
  const classNamesDefaults = {
    root: `flex items-center align-middle px-2 my-2`,
    button:
      'flex flex-nowrap items-center align-middle border-b-2 hover:border-accent border-transparent',
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

  return (
    <div
      className={extractClassName('root', mergedClassnames)}
      aria-label={ariaLabel ?? name}
    >
      <Tooltip
        label={tooltip}
        position="bottom"
        withArrow
        multiline
        color="base"
        disabled={tooltip === undefined}
        classNames={TooltipStyle}
      >
        <div
          className={extractClassName('button', mergedClassnames)}
          role="button"
          onClick={(event) => clickHandler && clickHandler()}
        >
          {leftIcon ? (
            <Icon
              icon={leftIcon}
              width={iconSz}
              height={iconSz}
              className={extractClassName('leftIcon', mergedClassnames)}
            />
          ) : null}
          <p className={extractClassName('label', mergedClassnames)}>{name}</p>
          {rightIcon && rightIcon.length > 0 ? (
            <Icon
              width={iconSz}
              height={iconSz}
              icon={rightIcon}
              className={extractClassName('rightIcon', mergedClassnames)}
            />
          ) : null}
        </div>
      </Tooltip>
    </div>
  );
};
