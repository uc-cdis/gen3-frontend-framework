import { checkRouteAccess, extractClassName } from '../utils';
import NavigationBarButton from '../NavigationBarButton';
import React from 'react';
import { LinkAuthStatus, NavigationProps } from '../types';
import { mergeDefaultTailwindClassnames } from '../../../utils/mergeDefaultTailwindClassnames';
import { useNavigationAuthState } from '../hooks';

type LeftSidePanelProps = Pick<
  NavigationProps,
  'items' | 'classNames' | 'hideUnauthorizedLinks'
>;

const LeftSidePanel = ({
  items = [],
  classNames = {},
  hideUnauthorizedLinks = false,
}: LeftSidePanelProps) => {
  const classNamesDefaults = {
    navigationPanel: 'w-32 bg-base-light border-r-2 border-base',
  };

  const mergedClassnames = mergeDefaultTailwindClassnames(
    classNamesDefaults,
    classNames,
  );

  const { loggedIn, pending, resources, routesConfig } =
    useNavigationAuthState();

  return (
    <div
      className={`flex flex-col justify-start items-center align-middle ${extractClassName(
        'navigationPanel',
        mergedClassnames,
      )}`}
    >
      {items.map((x, index) => {
        const linkAuthStatus = checkRouteAccess(
          x.href,
          resources,
          routesConfig,
          loggedIn,
          pending,
        );
        if (
          hideUnauthorizedLinks &&
          linkAuthStatus !== LinkAuthStatus.Authorized
        ) {
          return null;
        }
        return (
          <div key={`${x.name}-${index}`}>
            <NavigationBarButton
              tooltip={x.tooltip}
              icon={x.icon}
              href={x.href}
              name={x.name}
              classNames={x.classNames}
              authStatus={LinkAuthStatus.Authorized}
            />
          </div>
        );
      })}
    </div>
  );
};

export default LeftSidePanel;
