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
import {
  useDeepCompareCallback,
  useDeepCompareEffect,
  useDeepCompareMemo,
} from 'use-deep-compare';

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
        enabledWithNoAccess={item?.enabledWithNoAccess}
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
const DEFAULT_CLASSNAMES = {
  root: 'flex bg-base-max border-b-1 border-base-dark',
  navigationPanel: 'font-heading',
  logoAndTitlePanel: 'flex justify-center items-center align-middle',
  buttons: '',
  login:
    'pl-1 mr-6 bg-base-max text-base-contrast opacity-80 hover:opacity-100',
};

const useAuthorizationState = () => {
  const { status, pending } = useSession(false);
  const loggedIn = useDeepCompareMemo(() => status === 'issued', [status]);
  const routesConfig = useProtectedRoutesContext();

  const {
    data: resources,
    isFetching: isAuthzResourcesFetching,
    isSuccess: isAuthzResourcesSuccess,
    refetch,
  } = useGetAuthzResourcesQuery();

  useDeepCompareEffect(() => {
    if (!pending) refetch();
  }, [status, pending]);

  return {
    loggedIn,
    pending,
    resources: resources?.resources ?? [],
    routesConfig,
    isAuthzResourcesFetching,
    isAuthzResourcesSuccess,
  };
};

const useNavigationItems = (
  items: NavigationButtonProps[],
  hideUnauthorizedLinks: boolean,
  mergedClassnames: Record<string, string>,
  authState: ReturnType<typeof useAuthorizationState>,
  current: string,
) => {
  const {
    loggedIn,
    pending,
    resources,
    routesConfig,
    isAuthzResourcesFetching,
  } = authState;

  const createNavigationItems = useDeepCompareCallback(() => {
    return items.map((item, index) => {
      const linkAuthStatus = checkRouteAccess(
        item.href,
        resources,
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
          key={`${item.name}-${index}`}
          item={item}
          index={index}
          current={current}
          mergedClassnames={mergedClassnames}
          authStatus={linkAuthStatus}
        />
      );
    });
  }, [
    current,
    hideUnauthorizedLinks,
    isAuthzResourcesFetching,
    items,
    loggedIn,
    mergedClassnames,
    pending,
    resources,
    routesConfig,
  ]);

  const [navigationItems, setNavigationItems] = useState(createNavigationItems);

  useDeepCompareEffect(() => {
    if (authState.isAuthzResourcesSuccess) {
      setNavigationItems(createNavigationItems());
    }
  }, [authState.isAuthzResourcesSuccess, authState.loggedIn]);

  return navigationItems;
};

const NavigationBar = ({
  logo = undefined,
  title = undefined,
  items = [],
  classNames = {},
  hideUnauthorizedLinks = false,
}: NavigationProps): ReactElement => {
  const mergedClassnames = mergeDefaultTailwindClassnames(
    DEFAULT_CLASSNAMES,
    classNames,
  );

  const authState = useAuthorizationState();

  const router = useRouter();
  const [current, setCurrent] = useState(router.pathname);

  useEffect(() => {
    setCurrent(router.asPath);
  }, [router.asPath]);

  const navigationItems = useNavigationItems(
    items,
    hideUnauthorizedLinks,
    mergedClassnames,
    authState,
    current,
  );

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
        {navigationItems}
      </div>
    </div>
  );
};

export default NavigationBar;
