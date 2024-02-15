import React from 'react';
import { DownloadButtonPropsWithAction, DropdownsWithButtonsProps } from './types';
import { useDeepCompareMemo } from 'use-deep-compare';
import { DownloadButtonProps, type DropdownButtonsProps } from '../../components/Buttons/DropdownButtons';
import { Accessibility, FilterSet, useIsUserLoggedIn } from '@gen3/core';
import GuppyActionButtonUsingHook from './GuppyActionButton';
import { findButtonAction, NullButtonAction } from './actions/registeredActions';
import { Icon } from '@iconify/react';
import { MdDownload as DownloadIcon } from 'react-icons/md';
import { GuppyDropdownWithIcon } from './GuppyDropdownWithIcon';

const createDownloadMenuButton = (props: DropdownButtonsProps) : JSX.Element => {

  const elements = props.buttons.map((button) => {
    let disabled = false;
    let actionFunction  = NullButtonAction;
    let actionArgs = {};

    if (button.action) {
      const actionItem = findButtonAction(button.action);
      if (actionItem) {
        const funcArgs = actionItem.args ?? {};
        const func = actionItem.action;
        actionFunction = func;
        actionArgs = funcArgs ?? {} as Record<string, any>
      }
    }


    return {
      title: button.title,
      activeText: 'Downloading...',
      disabled: button.enabled !== undefined ? !button.enabled : true,
      icon: button?.leftIcon ? <Icon icon={button.leftIcon} /> : <DownloadIcon aria-label={"Download"}/>,
      rightSection: button?.rightIcon ? <Icon icon={button.rightIcon} /> : null,
      actionFunction: actionFunction,
      type: button.type,
      actionArgs: {
        ...actionArgs,
      },
    } as DownloadButtonPropsWithAction;
  })
  return (
    <GuppyDropdownWithIcon TargetButtonChildren={"Downloading..."} dropdownElements={elements} />
  )
}

interface DownloadsPanelProps {
  dropdowns: Record<string, DropdownsWithButtonsProps>;
  buttons: DownloadButtonProps[];
  loginForDownload?: boolean;
  accessibility?: Accessibility;
  rootPath?: string;
  index: string;
  totalCount: number;
  fields: string[];
  filter: FilterSet;
  sort?: string[];
}

const DownloadsPanel = ({
  dropdowns,
  buttons,
  loginForDownload,
  index,
  totalCount,
  fields,
  filter,
  accessibility,
  sort,
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

      // handle dropdowns
      {Object.values(dropdownsToRender).map((dropdown) =>
        {return createDownloadMenuButton(dropdown); })}

      // render individual buttons
      {buttons.map((button) => {
        let disabled = false;
        let actionFunction  = NullButtonAction;
        let actionArgs = {};
        console.log("button", button);
        if (button.action) {
          const actionItem = findButtonAction(button.action);
          console.log("found action item", actionItem);
          if (actionItem) {
            const funcArgs = actionItem.args ?? {};
            const func = actionItem.action;
            actionFunction = func;
            actionArgs = funcArgs ?? {} as Record<string, any>
          }
        }
        if (loginRequired && !isUserLoggedIn) {
          disabled = true;
        }

        return (
        <GuppyActionButtonUsingHook
          activeText={'Downloading...'}
          inactiveText={button.title}
          tooltipText={button.tooltipText}
          disabled={disabled || !button.enabled}
          actionFunction={actionFunction}
          actionArgs={
            {
              ...actionArgs,
              ...(button.actionArgs ?? {} as Record<string, any>),
              type: index,
              totalCount,
              fields,
              filter,
              accessibility : accessibility ?? Accessibility.ALL,
             // sort: sort, // TODO add sort
            }
          }
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
