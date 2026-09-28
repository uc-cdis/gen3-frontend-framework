import React from 'react';
import { Icon } from '@iconify-icon/react';
import { Tooltip, UnstyledButton } from '@mantine/core';
import { extractClassName } from './utils';
import { mergeDefaultTailwindClassnames } from '../../utils/mergeDefaultTailwindClassnames';
import { TooltipStyle } from './style';

import { useRouter } from 'next/router';
import { LinkAuthStatus, NavigationButtonWithAuthStatus } from './types';

const AuthTooltips: Record<LinkAuthStatus, string> = {
  loginRequired: 'Login required to access this page',
  pending: 'Checking your access…',
  unauthorized: 'You are logged in but not authorized to access this page',
  authorized: 'You are authorized to access this page',
};

/**
 * NavigationBarButton: a button for the navigation bar
 * @param tooltip - the tooltip text to display
 * @param icon - the icon to display
 * @param href - the href to link to
 * @param name - the name of the button
 * @param iconHeight - the height of the icon
 * @param classNames - the class names to use for root, label, icon/tooltip and arrow'
 * @param noBasePath - set to true to avoid prepending a basePath to the link
 * @param authStatus - the status of the user's authorization to access this page.
 */
const NavigationBarButton = ({
  tooltip,
  icon,
  href,
  name,
  iconHeight = '32px',
  classNames = {},
  authStatus,
  enabledWithNoAccess = false,
}: NavigationButtonWithAuthStatus) => {
  const classNamesDefaults = {
    root: 'flex flex-col nowrap px-3 py-2 pt-4 justify-between items-center align-center text-primary hover:text-accent opacity-80 hover:opacity-100 data-disabled:opacity-35 data-disabled:hover:text-primary data-disabled:hover:opacity-35',
    label: 'pt-1.5 body-typo font-heading text-sm text-nowrap',
    icon: 'data-disabled:opacity-50',
    ...TooltipStyle,
  };
  const router = useRouter();
  const mergedClassnames = mergeDefaultTailwindClassnames(
    classNamesDefaults,
    classNames,
  );

  let dataDisabled = authStatus !== 'authorized';
  if (enabledWithNoAccess && authStatus === 'unauthorized') {
    dataDisabled = false;
  }

  const handleClick = async () => {
    if (dataDisabled) {
      // Optional: open a modal / toast instead of doing nothing
      return;
    }
    await router.push(href);
  };

  let tooltipObj = AuthTooltips;

  // enable old string setting to still work
  if (typeof tooltip === 'string') {
    tooltipObj.authorized = tooltip;
    // new override method allowing full configuration
  } else if (typeof tooltip === 'object') {
    tooltipObj = { ...tooltipObj, ...tooltip };
  }

  return (
    <React.Fragment>
      <Tooltip
        label={tooltipObj[authStatus]}
        disabled={!tooltip}
        multiline
        position="bottom"
        arrowSize={8}
        withArrow
        zIndex={1000}
        w={220}
      >
        <div
          role="navigation"
          className={extractClassName('root', mergedClassnames)}
          data-disabled={dataDisabled ? true : undefined}
        >
          <UnstyledButton
            onClick={handleClick}
            classNames={{
              root: 'flex flex-col nowrap disabled:cursor-not-allowed',
            }}
            disabled={dataDisabled}
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
      </Tooltip>
    </React.Fragment>
  );
};

export default NavigationBarButton;
