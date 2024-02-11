import React from 'react';
import { DropdownsWithButtonsProps } from './types';
import { useDeepCompareMemo } from 'use-deep-compare';
import {
  DropdownButton,
  DownloadButtonProps,
} from '../../components/Buttons/DropdownButtons';
import ActionButton from '../../components/Buttons/ActionButton';
import { FilterSet, useIsUserLoggedIn, Accessibility } from '@gen3/core';
import { GuppyActionButton } from './DownloadButtons';
import { partial } from 'lodash';
import { downloadToFileAction } from './actions/buttonActions';

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
      <GuppyActionButton
        activeText={'Downloading...'}
        inactiveText={'Download'}
        toolTip={'Download data'}
        actionFunction={partial(downloadToFileAction, {
          type: index,
          filename: `${index}.json`,
          filter: filters,
          fields: fields,
          format: 'json',
          rootPath: rootPath,
          ...{ accessibility: accessibility || Accessibility.ALL },
        })}
      />

      {Object.values(dropdownsToRender).map((dropdown) => (
        <DropdownButton {...dropdown} key={dropdown.title} />
      ))}
      {buttons.map((button) => (
        <ActionButton {...button} key={button.title} />
      ))}
    </div>
  ) : (
    <React.Fragment></React.Fragment>
  );
};

export default DownloadsPanel;
