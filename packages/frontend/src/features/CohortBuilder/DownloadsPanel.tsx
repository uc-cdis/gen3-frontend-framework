import React, { useMemo } from 'react';
import {
  DownloadButtonPropsWithAction,
  DropdownsWithButtonsProps,
} from './types';
import {
  DownloadButtonProps,
  type DropdownButtonProps,
} from '../../components/Buttons/DropdownButtons';
import { Accessibility, FilterSet } from '@gen3/core';
import CohortActionButton from './downloads/CohortActionButton';
import {
  findButtonAction,
  NullButtonAction,
} from './downloads/actions/registeredDownloadButtonActions';
import { Icon } from '@iconify-icon/react';
import { MdDownload as DownloadIcon } from 'react-icons/md';
import CohortDropdownActionButton from './downloads/CohortDropdownActionButton';
import CohortDataLibraryListButton from './downloads/CohortDataLibraryListButton';
import { useSession } from '../../lib/session/session';

const resolveAction = (buttonAction?: string) => {
  let actionFunction = NullButtonAction;
  let actionArgs: Record<string, any> = {};
  if (buttonAction) {
    const actionItem = findButtonAction(buttonAction);
    if (actionItem) {
      actionFunction = actionItem.action;
      actionArgs = actionItem.args ?? {};
    }
  }
  return { actionFunction, actionArgs };
};

const createDownloadMenuButton = (
  props: DropdownButtonProps,
  commonActionArgs: Record<string, any>,
): JSX.Element => {
  const elements = props.dropdownItems?.map((button) => {
    const buttonAction = button.action ?? button.type;
    const { actionFunction, actionArgs } = resolveAction(buttonAction);

    return {
      title: button.title,
      activeText: 'Cancel',
      disabled: button.enabled !== undefined ? !button.enabled : true,
      icon: button?.leftIcon ? (
        <Icon icon={button.leftIcon} />
      ) : (
        <DownloadIcon aria-label={'Download'} />
      ),
      rightSection: button?.rightIcon ? <Icon icon={button.rightIcon} /> : null,
      actionFunction: actionFunction,
      actionArgs: {
        ...commonActionArgs,
        ...actionArgs,
        ...(button.actionArgs ?? {}),
      },
    } as DownloadButtonPropsWithAction;
  });

  return (
    <CohortDropdownActionButton
      inactiveText={props.title}
      activeText={props.actionTitle}
      leftIcon={props.leftIcon ? <Icon icon={props.leftIcon} /> : undefined}
      rightIcon={props.rightIcon ? <Icon icon={props.rightIcon} /> : undefined}
      TargetButtonChildren={'Downloading...'}
      dropdownElements={elements}
      key={props.title}
    />
  );
};

interface DownloadsPanelProps {
  readonly dropdowns: Record<string, DropdownsWithButtonsProps>;
  readonly buttons: ReadonlyArray<DownloadButtonProps>;
  readonly loginForDownload?: boolean;
  readonly accessibility?: Accessibility;
  readonly rootPath?: string;
  readonly index: string;
  readonly totalCount: number;
  readonly fields: ReadonlyArray<string>;
  readonly filter: FilterSet;
  readonly sort?: string[];
  readonly indexPrefix?: string;
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
  indexPrefix = '',
}: DownloadsPanelProps): JSX.Element => {
  const { status } = useSession(false);

  const isUserLoggedIn = useMemo(() => status === 'issued', [status]);

  const loginRequired = !!loginForDownload;

  const commonActionArgs = useMemo(
    () => ({
      type: index,
      totalCount,
      fields,
      filter,
      indexPrefix,
      accessibility: accessibility ?? Accessibility.ALL,
      // sort: sort, // TODO add sort
    }),
    [index, totalCount, fields, filter, indexPrefix, accessibility],
  );

  const dropdownsToRender = useMemo(() => {
    if (!loginRequired || isUserLoggedIn) return dropdowns;

    return Object.entries(dropdowns ?? {}).reduce(
      (acc, [key, dropdown]) => {
        return {
          ...acc,
          [key]: {
            ...dropdown,
            title: `${dropdown.title}`,
            buttons: dropdown.dropdownItems?.map((button) => ({
              ...button,
              title: `${button.title}`,
              enabled: false,
            })),
          },
        };
      },
      {} as Record<string, DropdownsWithButtonsProps>,
    );
  }, [dropdowns, loginRequired, isUserLoggedIn]);

  const dropdownElements = useMemo(() => {
    return Object.values(dropdownsToRender).map(
      (dropdown: DropdownsWithButtonsProps) =>
        createDownloadMenuButton(dropdown, commonActionArgs),
    );
  }, [dropdownsToRender, commonActionArgs]);

  const buttonElements = useMemo(() => {
    return buttons.map((button) => {
      const buttonAction = button.action ?? button.type;
      const { actionFunction, actionArgs } = resolveAction(buttonAction);

      const disabled = loginRequired && !isUserLoggedIn;

      if (actionFunction && buttonAction === 'cohortDataFilesToDataLibrary') {
        return (
          <CohortDataLibraryListButton
            activeText=""
            inactiveText={button.title}
            tooltipText={button.tooltipText}
            disabled={disabled || !button.enabled}
            actionFunction={actionFunction}
            actionArgs={{
              ...actionArgs,
              ...(button.actionArgs ?? {}),
              ...commonActionArgs,
            }}
            key={button.title}
          />
        );
      }

      return (
        <CohortActionButton
          activeText="Cancel"
          inactiveText={button.title}
          tooltipText={button.tooltipText}
          disabled={disabled || !button.enabled}
          actionFunction={actionFunction}
          actionArgs={{
            ...(button.actionArgs ?? {}),
            ...commonActionArgs,
            ...actionArgs,
          }}
          key={button.title}
        />
      );
    });
  }, [buttons, commonActionArgs, loginRequired, isUserLoggedIn]);

  return dropdowns || buttons ? (
    <div className="flex space-x-2 items-center">
      {dropdownElements}
      {buttonElements}
    </div>
  ) : (
    <React.Fragment></React.Fragment>
  );
};

export default DownloadsPanel;
