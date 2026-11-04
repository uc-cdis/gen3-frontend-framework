import type { JSX } from 'react';
import React, { useMemo } from 'react';
import type {
  DownloadButtonPropsWithAction,
  DropdownsWithButtonsProps,
} from './types';
import type { DownloadButtonProps } from '../../components/Buttons/DropdownButtons';
import { type DropdownButtonProps } from '../../components/Buttons/DropdownButtons';
import type { FilterSet } from '@gen3/core';
import { Accessibility, isCreateAndExportOutputConfig } from '@gen3/core';
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
import SubmitSowerJobButton from '../Sower/actions/SubmitSowerJobButton';
import { LoginGate } from '../../components/Login/LoginGate';

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
      disabled: button.enabled !== undefined ? !button.enabled : false,
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
        ...button.actionArgs,
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
  readonly enableRedirectToLogin?: boolean;
  readonly accessibility?: Accessibility;
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
  enableRedirectToLogin,
  index,
  totalCount,
  fields,
  filter,
  accessibility,
  indexPrefix = '',
}: Readonly<DownloadsPanelProps>): JSX.Element => {
  const { status } = useSession(false);

  const isUserLoggedIn = useMemo(() => status === 'issued', [status]);

  const loginRequired = !!loginForDownload;

  const cohortActionArgs = useMemo(
    () => ({
      type: index,
      totalCount,
      fields,
      filter,
      indexPrefix,
      index,
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
            dropdownItems: dropdown.dropdownItems?.map((button) => ({
              ...button,
              title: button.title,
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
        createDownloadMenuButton(dropdown, cohortActionArgs),
    );
  }, [dropdownsToRender, cohortActionArgs]);

  const buttonElements = useMemo(() => {
    return buttons.map((button) => {
      const buttonAction = button.action ?? button.type;

      const disabled = loginRequired && !isUserLoggedIn;
      if (buttonAction === 'sower') {
        if (isCreateAndExportOutputConfig(button.actionArgs)) {
          const { jobAction, outputAction } = button.actionArgs;
          const btn = (
            <SubmitSowerJobButton
              label={button.title}
              tooltipText={button.tooltipText}
              disabled={disabled || !button.enabled}
              actions={{
                jobAction: {
                  name: jobAction.name,
                  parameters: { ...jobAction.parameters, ...cohortActionArgs },
                },
                outputAction: outputAction
                  ? {
                      name: outputAction.name,
                      parameters: outputAction.parameters,
                    }
                  : undefined,
              }}
              key={button.title}
            />
          );
          if (enableRedirectToLogin) {
            return (
              <LoginGate key={`${button.title}-login-gate`}>{btn}</LoginGate>
            );
          } else {
            return btn;
          }
        }
        console.warn(
          `DownloadsPanel: sower button "${button.title}" has invalid or missing actionArgs — skipping`,
        );
        return null;
      }

      const { actionFunction, actionArgs } = resolveAction(buttonAction);
      if (actionFunction && buttonAction === 'cohortDataFilesToDataLibrary') {
        const btn = (
          <CohortDataLibraryListButton
            activeText=""
            inactiveText={button.title}
            tooltipText={button.tooltipText}
            disabled={disabled || !button.enabled}
            actionFunction={actionFunction}
            actionArgs={{
              ...actionArgs,
              ...button.actionArgs,
              ...cohortActionArgs,
            }}
            key={button.title}
          />
        );
        if (enableRedirectToLogin) {
          return (
            <LoginGate key={`${button.title}-login-gate`}>{btn}</LoginGate>
          );
        } else {
          return btn;
        }
      }

      const btn = (
        <CohortActionButton
          activeText="Cancel"
          inactiveText={button.title}
          tooltipText={button.tooltipText}
          disabled={disabled || !button.enabled}
          actionFunction={actionFunction}
          actionArgs={{
            ...button.actionArgs,
            ...cohortActionArgs,
            ...actionArgs,
          }}
          key={button.title}
        />
      );
      if (enableRedirectToLogin) {
        return <LoginGate key={`${button.title}-login-gate`}>{btn}</LoginGate>;
      } else {
        return btn;
      }
    });
  }, [
    buttons,
    cohortActionArgs,
    loginRequired,
    isUserLoggedIn,
    enableRedirectToLogin,
  ]);

  return dropdowns || buttons ? (
    <div className="flex space-x-2 items-center">
      {dropdownElements}
      {buttonElements}
    </div>
  ) : (
    <React.Fragment />
  );
};

export default DownloadsPanel;
