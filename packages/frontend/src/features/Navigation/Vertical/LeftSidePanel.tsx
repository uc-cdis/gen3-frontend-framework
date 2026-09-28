import { checkRouteAccess, extractClassName } from '../utils';
import NavigationBarButton from '../NavigationBarButton';
import React from 'react';
import { LinkAuthStatus, NavigationProps } from '../types';
import { mergeDefaultTailwindClassnames } from '../../../utils/mergeDefaultTailwindClassnames';
import { useSession } from '../../../lib/session/session';
import { useDeepCompareEffect, useDeepCompareMemo } from 'use-deep-compare';
import { useProtectedRoutesContext } from '../../../components/AuthorizedRoutes/ProtectedRoutesProvider';
import { useGetAuthzResourcesQuery } from '@gen3/core';

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

  const { status, pending } = useSession(false); // no redirect side-effects here
  const loggedIn = useDeepCompareMemo(() => status === 'issued', [status]);
  const routesConfig = useProtectedRoutesContext();
  const {
    data: resources,
    error: authzResourceError,
    isFetching: isAuthzResourcesFetching,
    isError: isAuthzResourcesError,
    refetch,
  } = useGetAuthzResourcesQuery();

  useDeepCompareEffect(() => {
    if (loggedIn && !isAuthzResourcesFetching && !isAuthzResourcesError) {
      void refetch();
    }
  }, [loggedIn, isAuthzResourcesFetching, isAuthzResourcesError, refetch]);
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
          resources?.resources ?? [],
          routesConfig,
          loggedIn,
          pending || isAuthzResourcesFetching,
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
