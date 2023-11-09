import React from 'react';
import { NavigationButtonProps } from './types';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Tooltip } from '@mantine/core';
import { extractClassName } from './utils';

/**
 * NavigationBarButton: a button for the navigation bar
 * @param tooltip - the tooltip text to display
 * @param icon - the icon to display
 * @param href - the href to link to
 * @param name - the name of the button
 * @param iconHeight - the height of the icon
 * @param classNames - the class names to use
 *  - root: the root class name for the button
 *    default: 'flex flex-col flex-nowrap px-1 py-2 pt-4 items-center hover:text-accent opacity-80 hover:opacity-100'
 *  - label: the class name for the label
 *    default: 'content-center pt-1.5 body-typo font-heading text-sm'
 *  - icon: the class name for the icon
 *    default: 'mt-0.5 ml-1'
 *  - tooltip: the class name for the tooltip
 *    default: 'text-base-light'
 *  - arrow: the class name for the tooltip arrow
 *    default: 'text-base-light'
 */
const NavigationBarButton: React.FC<NavigationButtonProps> = ({
  tooltip,
  icon,
  href,
  name,
  iconHeight = '27px',
  classNames = {},
}: NavigationButtonProps) => {

  const classNamesDefaults = {
    root: 'flex flex-col flex-nowrap px-1 py-2 pt-4 items-center hover:text-accent opacity-80 hover:opacity-100',
    label: 'content-center pt-1.5 body-typo font-heading text-sm',
    icon: 'mt-0.5 ml-1',
    tooltip: 'bg-primary-light text-base-contrast-light text-xl',
    arrow: 'bg-base-light',
  };

  const mergedClassnames = {...classNamesDefaults, ...classNames};
  return (
    <>
      <Tooltip
        label={tooltip}
        multiline
        position="bottom"
        withArrow
        color="base"
        classNames={{
          tooltip: mergedClassnames.tooltip,
          arrow: mergedClassnames.arrow,
        }}
        width={220}
      >
        <Link
          className="content-center"
          href={`${
            // need this to preserve running in hybrid mode
            process.env.NEXT_PUBLIC_PORTAL_BASENAME &&
            process.env.NEXT_PUBLIC_PORTAL_BASENAME !== '/'
              ? process.env.NEXT_PUBLIC_PORTAL_BASENAME
              : ''
          }${href}`}
        >
          <div className={extractClassName('root', mergedClassnames)}>
            <Icon
              height={iconHeight}
              icon={icon}
              className={extractClassName('icon', mergedClassnames)}
            />
            <p className={extractClassName('label', mergedClassnames)}>{name}</p>
          </div>
        </Link>
      </Tooltip>
    </>
  );
};

export default NavigationBarButton;
