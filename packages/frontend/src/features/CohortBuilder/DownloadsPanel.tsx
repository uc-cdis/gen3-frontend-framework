import React from 'react';
import { DropdownsWithButtonsProps } from './types';
import { useDeepCompareMemo } from 'use-deep-compare';
import {
  DropdownButton,
  DownloadButtonProps,
} from '../../components/Buttons/DropdownButtons';
import ActionButton from '../../components/Buttons/ActionButton';
import { FilterSet, useIsUserLoggedIn, convertFilterSetToGqlFilter } from '@gen3/core';
import { DownloadToFileButton } from './Downloads';



interface DownloadsPanelProps {
  dropdowns: Record<string, DropdownsWithButtonsProps>;
  buttons: DownloadButtonProps[];
  loginForDownload?: boolean;
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

      <DownloadToFileButton
        type={index}
        counts={totalCount}
        fields={fields}
        filter={convertFilterSetToGqlFilter(filters)}
        filename={`cohort_${index}`}
        format="json"
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
