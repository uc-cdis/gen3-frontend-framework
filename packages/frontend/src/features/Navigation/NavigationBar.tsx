import React from 'react';
import { NavigationProps } from './types';
import NavigationLogo from './NavigationLogo';
import NavigationBarButton from './NavigationBarButton';
import { extractClassName } from './utils';

/**
 * NavigationBar component
 * @param {Object} NavigationProps - The navigation properties
 * @param {Object} NavigationProps.logo - The logo object
 * @param {Array} NavigationProps.items - The array of navigation items
 * @param {Object} NavigationProps.classNames - The custom class names for different elements of the NavigationBar
 * @returns {JSX.Element} The rendered NavigationBar component
 */
const NavigationBar = ({
  logo = undefined,
  items = [],
  classNames = {},
}: NavigationProps) => {
  const classNamesDefaults = {
    root: 'flex bg-base-max py-3 border-b-1 border-base-contrast',
    navigationPanel: 'font-heading font-bold tracking-wide text-xl space-x-4',
    login:
      'pl-1 mr-6 bg-base-max text-base-contrast opacity-80 hover:opacity-100',
  };

  const mergedClassnames = { ...classNamesDefaults, ...classNames };

  return (
    <div className={extractClassName('root', mergedClassnames)}>
      <div
        className={`flex justify-center items-center align-middle ${extractClassName(
          'logo',
          mergedClassnames,
        )}`}
      >
        {logo && <NavigationLogo {...{ ...logo }} />}
      </div>
      <div className="flex-grow">{/* middle section of header */}</div>
      <div
        className={`flex justify-center items-center align-middle ${extractClassName(
          'navigationPanel',
          mergedClassnames,
        )}`}
      >
        {items.map((x, index) => {
          return (
            <div key={`${x.name}-${index}`}>
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
