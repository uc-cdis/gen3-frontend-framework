import React from 'react';
import { NavigationButtonProps } from './types';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Tooltip } from '@mantine/core';
import { extractClassName } from './utils';
import { mergeDefaultTailwindClassnames } from '../../utils/mergeDefaultTailwindClassnames';

/**
 * NavigationBarButton: a button for the navigation bar
 * @param tooltip - the tooltip text to display
 * @param icon - the icon to display
 * @param href - the href to link to
 * @param name - the name of the button
 * @param iconHeight - the height of the icon
 * @param classNames - the class names to use for root, label, icon/ tooltip and arrow'
 */
const NavigationBarButton = ({
  tooltip,
  icon,
  href,
  name,
  iconHeight = '27px',
  classNames = {},
}: NavigationButtonProps) => {
  const classNamesDefaults = {
    root: 'flex flex-col flex-nowrap px-3 py-2 pt-4 items-center align-center hover:text-accent opacity-80 hover:opacity-100',
    label: 'pt-1.5 body-typo font-heading text-sm',
    icon: 'mt-0.5 ml-1',
    tooltip: 'bg-base-min text-base-contrast-min text-xl border-1 border-base-contrast',
    arrow: 'bg-base-light',
  };

  const mergedClassnames = mergeDefaultTailwindClassnames(classNamesDefaults, classNames);;
  return (
    <React.Fragment>
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
            <p className={extractClassName('label', mergedClassnames)}>
              {name}
            </p>
          </div>
        </Link>
      </Tooltip>
    </React.Fragment>
  );
};

export default NavigationBarButton;
