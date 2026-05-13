import React, { ReactElement } from 'react';

import { LinkAuthStatus, NavigationProps } from '../types';
import NavigationBarButton from '../NavigationBarButton';
import NavigationLogo from '../NavigationLogo';
import LoginButton from '../../../components/Login/LoginButton';
import { AiOutlineLogin as LoginIcon } from 'react-icons/ai';
import { checkRouteAccess, extractClassName } from '../utils';
import ActionMenu from '../ActionMenu';
import { mergeDefaultTailwindClassnames } from '../../../utils/mergeDefaultTailwindClassnames';
import { LoginButtonVisibility } from '../../../components/Login/types';
import { TopBarProps } from '../TopBar/types';
import { useSession } from '../../../lib/session/session';
import { useDeepCompareEffect, useDeepCompareMemo } from 'use-deep-compare';
import { useProtectedRoutesContext } from '../../../components/AuthorizedRoutes/ProtectedRoutesProvider';
import { useGetAuthzResourcesQuery } from '@gen3/core';

export interface HorizontalNavigationBarProps extends NavigationProps {
  readonly actions: TopBarProps;
  loginIcon?: ReactElement | string;
}

const HorizontalNavigationBar = ({
  actions,
  items,
  logo = undefined,
  loginIcon = <LoginIcon size={'3.15rem'} />,
  classNames = {},
  hideUnauthorizedLinks = false,
}: HorizontalNavigationBarProps) => {
  const classNamesDefaults = {
    root: 'py-3 border-b-1 border-base-light shadow-sm',
    navigationPanel: 'font-heading font-bold tracking-wide text-xl space-x-4',
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

  return (
    <div
      className={`flex justify-between ${extractClassName(
        'root',
        mergedClassnames,
      )}`}
    >
      <div
        className={`flex justify-center items-center align-middle ${extractClassName(
          'logo',
          mergedClassnames,
        )}`}
      >
        {logo && <NavigationLogo {...{ ...logo }} />}
      </div>
      <div
        className={`flex justify-center items-center align-middle ${extractClassName(
          'navigationPanel',
          mergedClassnames,
        )}`}
      >
        {items?.map((x, index) => {
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
                noBasePath={x?.noBasePath}
                authStatus={LinkAuthStatus.Authorized}
                enabledWithNoAccess={x?.enabledWithNoAccess}
              />
            </div>
          );
        })}
      </div>
      <div />
      <div className="flex items-center align-middle mr-3">
        {actions.loginButtonVisibility === LoginButtonVisibility.Visible ? (
          <LoginButton
            icon={loginIcon}
            hideText
            className={`${extractClassName('login', mergedClassnames)}`}
            tooltip={'Login to the commons'}
            visibility={actions?.loginButtonVisibility}
          />
        ) : null}
        <ActionMenu items={actions.items} />
      </div>
    </div>
  );
};

export default HorizontalNavigationBar;
