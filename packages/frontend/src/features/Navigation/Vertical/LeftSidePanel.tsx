import { extractClassName } from '../utils';
import NavigationBarButton from '../NavigationBarButton';
import React from 'react';
import { NavigationButtonProps, NavigationProps } from '../types';

type LeftSidePanelProps = Pick<NavigationProps, 'items' | 'classNames'>;

const LeftSidePanel = ({
  items = [],
  classNames = {},
}: LeftSidePanelProps) => {
  const classNamesDefaults = {
    navigationPanel: 'w-32 bg-base-light border-r-2 border-base',
    login:
      'pl-1 mr-6 bg-base-max text-base-contrast opacity-80 hover:opacity-100',
  };

  const mergedClassnames = { ...classNamesDefaults, ...classNames };

  return (
    <div
      className={`flex flex-col justify-start items-center align-middle ${extractClassName(
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
  );
};

export default LeftSidePanel;
