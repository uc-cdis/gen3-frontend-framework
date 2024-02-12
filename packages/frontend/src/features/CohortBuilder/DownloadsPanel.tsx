import React from 'react';
import { DropdownsWithButtonsProps } from './types';
import { useDeepCompareMemo } from 'use-deep-compare';
import {
  DropdownButton,
  DownloadButtonProps,
} from '../../components/Buttons/DropdownButtons';
import { FilterSet, useIsUserLoggedIn, Accessibility } from '@gen3/core';
import { GuppyActionButton } from './DownloadButtons';
import { partial } from 'lodash';
import { downloadToFileAction } from './actions/downloadToFile';
import { findButtonAction, NullButtonAction } from './actions/registeredActions';

interface DownloadsPanelProps {
  dropdowns: Record<string, DropdownsWithButtonsProps>;
  buttons: DownloadButtonProps[];
  loginForDownload?: boolean;
  accessibility?: Accessibility;
  rootPath?: string;
  index: string;
  totalCount: number;
  fields: string[];
  filters: FilterSet;
}

const DownloadsPanel = ({
  dropdowns,
  buttons,
  loginForDownload,
  index,
  totalCount,
  fields,
  filters,
  accessibility,
  rootPath,
}: DownloadsPanelProps): JSX.Element => {
  const isUserLoggedIn = useIsUserLoggedIn();
  const loginRequired = loginForDownload ? loginForDownload : false;

  const dropdownsToRender = useDeepCompareMemo(() => {
    let dropdownsToRender = dropdowns;

    if (loginRequired && !isUserLoggedIn) {
      dropdownsToRender = Object.entries(dropdowns ?? {}).reduce(
        (acc, [key, dropdown]) => {
          return {
            ...acc,
            [key]: {
              ...dropdown,
              title: `${dropdown.title} (Login Required)`,
              buttons: dropdown.buttons.map((button) => ({
                ...button,
                title: `${button.title} (Login Required)`,
                enabled: false,
              })),
            },
          };
        },
        {},
      );
    }
    return dropdownsToRender;
  }, [dropdowns, isUserLoggedIn, loginRequired]);

  return dropdowns ? (
    <div className="flex space-x-1">

      {Object.values(dropdownsToRender).map((dropdown) => (
        <DropdownButton {...dropdown} key={dropdown.title} />
      ))}

      {buttons.map((button) => {
        let disabled = false;
        let actionFunction  = NullButtonAction;
        if (button.action) {
          const actionItem = findButtonAction(button.action);
          if (actionItem) {
            const funcArgs = actionItem.args ?? {};
            const func = actionItem.action;
            actionFunction = partial(func, {
              type: index,
              filter: filters,
              fields: fields,
              ...{ accessibility: accessibility || Accessibility.ALL },
              ...(funcArgs ?? {} as Record<string, any>),
            });
          }
        }
        if (loginRequired && !isUserLoggedIn) {
          disabled = true;
        }

        return (
        <GuppyActionButton
          activeText={'Downloading...'}
          inactiveText={button.title}
          tooltipText={button.tooltipText}
          disabled={disabled || !button.enabled}
          actionFunction={actionFunction}
          key={button.title}
        />
      );}
      )}
    </div>
  ) : (
    <React.Fragment></React.Fragment>
  );
};

export default DownloadsPanel;
