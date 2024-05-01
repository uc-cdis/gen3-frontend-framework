import React from 'react';
import { NavigationButtonProps } from './types';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Tooltip } from '@mantine/core';
import { extractClassName } from './utils';
import { mergeDefaultTailwindClassnames } from '../../utils/mergeDefaultTailwindClassnames';
import { TooltipStyle } from './style';
import { TooltipStyle } from './style';

/**
 * NavigationBarButton: a button for the navigation bar
 * @param tooltip - the tooltip text to display
 * @param icon - the icon to display
 * @param href - the href to link to
 * @param name - the name of the button
 * @param iconHeight - the height of the icon
 * @param classNames - the class names to use for root, label, icon/tooltip and arrow'
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
    label: 'pt-1.5 body-typo font-heading text-sm text-primary  hover:text-accent',
    icon: 'mt-0.5 ml-1 text-primary hover:text-accent',
    ...TooltipStyle
  };

  const mergedClassnames = mergeDefaultTailwindClassnames(classNamesDefaults, classNames);
  return (
    <React.Fragment>
      <Tooltip
        label={tooltip}
        multiline
        position="bottom"
        withArrow
        color="base.8"
        classNames={{
          tooltip: mergedClassnames.tooltip,
          arrow: mergedClassnames.arrow,
        }}
        zIndex={1000}
        zIndex={1000}
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
