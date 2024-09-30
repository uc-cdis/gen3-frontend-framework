import React, { ReactElement, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NavigationProps } from './types';
import NavigationLogo from './NavigationLogo';
import NavigationBarButton from './NavigationBarButton';
import { extractClassName } from './utils';
import { mergeDefaultTailwindClassnames } from '../../utils/mergeDefaultTailwindClassnames';

/**
 * NavigationBar component
 * @param {Object} NavigationProps - The navigation properties
 * @param {Object} NavigationProps.logo - The logo object
 * @param {Array} NavigationProps.items - The array of navigation items
 * @param {Object} NavigationProps.classNames - The custom class names for different elements of the NavigationBar
 * @returns {ReactElement} The rendered NavigationBar component
 */
const NavigationBar = ({
  logo = undefined,
  title = undefined,
  items = [],
  classNames = {},
}: NavigationProps): ReactElement => {
  const classNamesDefaults = {
    root: 'flex bg-base-max border-b-1 border-base-dark',
    navigationPanel: 'font-heading',
    logoAndTitlePanel: 'flex justify-center items-center align-middle',
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
    setCurrent(router.pathname);
  }, [router.pathname]);

  console.log(
    'gir',
    `grid grid-cols-${items?.length} ${extractClassName('navigationPanel', mergedClassnames)}`,
  );

  return (
    <div className={extractClassName('root', mergedClassnames)}>
      <div className={extractClassName('logoAndTitlePanel', mergedClassnames)}>
        {logo && <NavigationLogo {...{ ...logo }} />}
      </div>
      <div className="flex flex-grow">{/* middle section of header */}</div>
      <div
        className={`grid grid-cols-${items?.length} ${extractClassName(
          'navigationPanel',
          mergedClassnames,
        )}`}
      >
        {items.map((x, index) => {
          const selectedStyle =
            current === x.href
              ? 'border-accent border-b-4 border-b-accent'
              : '';
          return (
            <div
              key={`${x.name}-${index}`}
              className={`first:border-l-1 border-r-1 border-base-dark ${selectedStyle}`}
            >
              <NavigationBarButton
                tooltip={x.tooltip}
                icon={x.icon}
                href={x.href}
                name={x.name}
                classNames={x.classNames}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationBar;
