import React, { ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NavigationProps } from './types';
import NavigationLogo from './NavigationLogo';
import NavigationBarButton from './NavigationBarButton';
import { extractClassName } from './utils';
import { mergeDefaultTailwindClassnames } from '../../utils/mergeDefaultTailwindClassnames';
import { useRouteAccess } from '../../components/AuthorizedRoutes/useRouteAccess';
import { NavigationButtonProps } from './NavigationButton'; // or wherever this type is defined

interface NavigationBarItemProps {
  item: NavigationButtonProps;
  current: string;
  mergedClassnames: Record<string, string>;
  hideUnauthorizedLinks: boolean;
  index: number;
}

const NavigationBarItem = ({
  item,
  current,
  mergedClassnames,
  hideUnauthorizedLinks,
}: NavigationBarItemProps) => {
  const { allowed } = useRouteAccess(item.href);

  if (hideUnauthorizedLinks && !allowed) {
    return null;
  }

  const selectedStyle =
    current === item.href ? 'border-accent border-b-4 border-b-accent' : '';

  return (
    <div
      className={`first:border-l-1 border-r-1 flex-1 border-base-dark ${selectedStyle} ${extractClassName(
        'buttons',
        mergedClassnames,
      )}`}
    >
      <NavigationBarButton
        tooltip={item.tooltip}
        icon={item.icon}
        href={item.href}
        name={item.name}
        classNames={item.classNames}
        noBasePath={item?.noBasePath}
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
        {items.map((x, index) => (
          <NavigationBarItem
            key={`${x.name}-${index}`}
            item={x}
            index={index}
            current={current}
            mergedClassnames={mergedClassnames}
            hideUnauthorizedLinks={hideUnauthorizedLinks}
          />
        ))}
      </div>
    </div>
  );
};

export default NavigationBar;
