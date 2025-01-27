import React from 'react';
import { NavigationButtonProps } from './types';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Tooltip } from '@mantine/core';
import { extractClassName } from './utils';
import { mergeDefaultTailwindClassnames } from '../../utils/mergeDefaultTailwindClassnames';
import { TooltipStyle } from './style';

/**
 * NavigationBarButton: a button for the navigation bar
 * @param tooltip - the tooltip text to display
 * @param icon - the icon to display
 * @param href - the href to link to
 * @param name - the name of the button
 * @param iconHeight - the height of the icon
 * @param classNames - the class names to use for root, label, icon/tooltip and arrow'
 * @param noBasePath - set to true to avoid prepending a basePath to the link
 */
const NavigationBarButton = ({
  tooltip,
  icon,
  href,
  name,
  iconHeight = '27px',
  classNames = {},
  noBasePath = false,
}: NavigationButtonProps) => {
  const classNamesDefaults = {
    root: 'flex flex-col flex-nowrap px-3 py-2 pt-4 items-center align-center text-primary hover:text-accent opacity-80 hover:opacity-100',
    label: 'pt-1.5 body-typo font-heading text-sm text-nowrap',
    icon: 'mt-0.5 ml-1',
    ...TooltipStyle,
  };

  const mergedClassnames = mergeDefaultTailwindClassnames(
    classNamesDefaults,
    classNames,
  );
  return (
    <React.Fragment>
      <Tooltip
        label={tooltip}
        disabled={!tooltip}
        multiline
        position="bottom"
        arrowSize={8}
        withArrow
        zIndex={1000}
        w={220}
      >
        {noBasePath ? (
          <a href={`${href}`}>
            <div
              className={extractClassName('root', mergedClassnames)}
              role="navigation"
            >
              <Icon
                height={iconHeight}
                icon={icon}
                className={extractClassName('icon', mergedClassnames)}
              />
              <p className={extractClassName('label', mergedClassnames)}>
                {name}
              </p>
            </div>
          </a>
        ) : (
          <Link
            href={`${
              // need this to preserve running in hybrid mode
              process.env.NEXT_PUBLIC_PORTAL_BASENAME &&
              process.env.NEXT_PUBLIC_PORTAL_BASENAME !== '/'
                ? process.env.NEXT_PUBLIC_PORTAL_BASENAME
                : ''
            }${href}`}
          >
            <div
              className={extractClassName('root', mergedClassnames)}
              role="navigation"
            >
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
        )}
      </Tooltip>
    </React.Fragment>
  );
};

export default NavigationBarButton;
