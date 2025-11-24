import React from 'react';
import { NavigationButtonProps } from './types';
import { Icon } from '@iconify-icon/react';
import { Tooltip, UnstyledButton } from '@mantine/core';
import { extractClassName } from './utils';
import { mergeDefaultTailwindClassnames } from '../../utils/mergeDefaultTailwindClassnames';
import { TooltipStyle } from './style';
import { useRouteAccess } from '../../lib/authz/useRouteAccess';
import { useRouter } from 'next/router';

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
  iconHeight = '32px',
  classNames = {},
  noBasePath = false,
}: NavigationButtonProps) => {
  const classNamesDefaults = {
    root: 'flex flex-col flex-nowrap px-3 py-2 pt-4 justify-between items-center align-center text-primary hover:text-accent opacity-80 hover:opacity-100',
    label: 'pt-1.5 body-typo font-heading text-sm text-nowrap',
    ...TooltipStyle,
  };
  const router = useRouter();
  const mergedClassnames = mergeDefaultTailwindClassnames(
    classNamesDefaults,
    classNames,
  );

  const { loading, allowed, isProtected, loginRequired, authzRequired, loggedIn } =
    useRouteAccess(href);

  const handleClick = () => {
    if (!allowed) {
      // Optional: open a modal / toast instead of doing nothing
      return;
    }
    router.push(href);
  };

  let tooltipText = tooltip;
  if (loading) {
    tooltipText = 'Checking your access…';
  } else if (!loggedIn && loginRequired) {
    tooltipText = 'Login required to access this page';
  } else if (!allowed && authzRequired) {
    tooltipText = 'You are logged in but not authorized to access this page';
  }

  return (
    <React.Fragment>
      <Tooltip
        label={tooltipText}
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
            <div
              role="navigation" className={extractClassName('root', mergedClassnames)}
            ><UnstyledButton onClick={handleClick} classNames={{"root" : "flex flex-col nowrap"  }}
            >
              <Icon
                height={iconHeight}
                icon={icon}
                className={extractClassName('icon', mergedClassnames)}
              />
              <p className={extractClassName('label', mergedClassnames)}>
                {name}
              </p>
            </UnstyledButton>
            </div>
        )}
      </Tooltip>
    </React.Fragment>
  );
};

export default NavigationBarButton;
