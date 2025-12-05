import React, { ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  LinkAuthStatus,
  NavigationButtonProps,
  NavigationProps,
} from './types';
import { LoadingOverlay } from '@mantine/core';
import NavigationLogo from './NavigationLogo';
import NavigationBarButton from './NavigationBarButton';
import { checkRouteAccess, extractClassName } from './utils';
import { mergeDefaultTailwindClassnames } from '../../utils/mergeDefaultTailwindClassnames';

import { useSession } from '../../lib/session/session';
import { useProtectedRoutesContext } from '../../components/AuthorizedRoutes/ProtectedRoutesProvider';
import { useGetAuthzResourcesQuery } from '@gen3/core';
import { useDeepCompareEffect, useDeepCompareMemo } from 'use-deep-compare';

interface NavigationBarItemProps {
  item: NavigationButtonProps;
  current: string;
  mergedClassnames: Record<string, string>;
  index: number;
  authStatus: LinkAuthStatus;
}

const NavigationBarItem = ({
  item,
  current,
  mergedClassnames,
  authStatus,
}: NavigationBarItemProps) => {
  const selectedStyle =
    current === item.href ? 'border-accent border-b-4 border-b-accent' : '';

  return (
    <div
      className={`first:border-l-1 border-r-1 flex-1 border-base-dark ${selectedStyle} ${extractClassName(
        'buttons',
        mergedClassnames,
      )}`}
    >
      <LoadingOverlay visible={authStatus === LinkAuthStatus.Pending} />
      <NavigationBarButton
        tooltip={item.tooltip}
        icon={item.icon}
        href={item.href}
        name={item.name}
        classNames={item.classNames}
        noBasePath={item?.noBasePath}
        authStatus={authStatus}
      />
    </div>
  );
};

/**
 * NavigationBar component
 * @param logo - The logo object
 * @param {Array} items - The array of navigation items
 * @param {Object} classNames - The custom class names for different elements of the NavigationBar
 * @param {boolean} hideUnauthorizedLinks - Hist navigation items that the user is not authorized to access. Defaults to false.
 * @returns {ReactElement} The rendered NavigationBar component
 */
const NavigationBar = ({
  logo = undefined,
  title = undefined,
  items = [],
  classNames = {},
  hideUnauthorizedLinks = false,
}: NavigationProps): ReactElement => {
  const classNamesDefaults = {
    root: 'flex bg-base-max border-b-1 border-base-dark',
    navigationPanel: 'font-heading',
    logoAndTitlePanel: 'flex justify-center items-center align-middle',
    buttons: '',
    login:
      'pl-1 mr-6 bg-base-max text-base-contrast opacity-80 hover:opacity-100',
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
      refetch();
    }
  }, [loggedIn, isAuthzResourcesFetching, isAuthzResourcesError, refetch]);

  const router = useRouter();
  const [current, setCurrent] = useState(router.pathname);
  useEffect(() => {
    setCurrent(router.asPath);
  }, [router.asPath]);

  return (
    <div
      role="navigation"
      aria-label="main site navigation"
      className={extractClassName('root', mergedClassnames)}
    >
      <div className={extractClassName('logoAndTitlePanel', mergedClassnames)}>
        {logo && <NavigationLogo {...{ ...logo }} />}
      </div>
      <div className="flex flex-grow">{/* middle section of header */}</div>
      <div
        className={`flex flex-grow nowrap ${extractClassName(
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
            <NavigationBarItem
              key={`${x.name}-${index}`}
              item={x}
              index={index}
              current={current}
              mergedClassnames={mergedClassnames}
              authStatus={linkAuthStatus}
            />
          );
        })}
      </div>
    </div>
  );
};

export default NavigationBar;
