import React from 'react';
import {
  DownloadButtonPropsWithAction,
  DropdownsWithButtonsProps,
} from './types';
import { useDeepCompareMemo } from 'use-deep-compare';
import {
  DownloadButtonProps,
  type DropdownButtonProps,
} from '../../components/Buttons/DropdownButtons';
import {
  Accessibility,
  FilterSet,
  isAuthenticated,
  useCoreSelector,
  selectUserAuthStatus,
} from '@gen3/core';
import CohortActionButton from './downloads/CohortActionButton';
import {
  findButtonAction,
  NullButtonAction,
} from './downloads/actions/registeredActions';
import { Icon } from '@iconify/react';
import { MdDownload as DownloadIcon } from 'react-icons/md';
import CohortDropdownActionButton from './downloads/CohortDropdownActionButton';
import CohortSubmitJobActionButton from './downloads/actions/TwoStepActionButton';
import { DispatchJobButtonProps } from '../../components/Buttons/DropdownButtons/types';

const createDownloadMenuButton = (
  props: DropdownButtonProps,
  args: Record<string, any>,
): JSX.Element => {
  const elements = props.dropdownItems?.map((button) => {
    let actionFunction = NullButtonAction;
    let actionParams = {};

    const buttonAction = button.action ?? button.type;

    if (buttonAction) {
      const actionItem = findButtonAction(buttonAction);
      if (actionItem) {
        actionFunction = actionItem.action;
        actionParams = actionItem.args ?? ({} as Record<string, any>);
      }
    }

    return {
      title: button.title,
      activeText: 'Downloading...',
      disabled: button.enabled !== undefined ? !button.enabled : true,
      icon: button?.leftIcon ? (
        <Icon icon={button.leftIcon} />
      ) : (
        <DownloadIcon aria-label={'Download'} />
      ),
      rightSection: button?.rightIcon ? <Icon icon={button.rightIcon} /> : null,
      actionFunction: actionFunction,
      actionArgs: {
        ...args,
        ...actionParams,
        ...(button.actionArgs ?? ({} as Record<string, any>)),
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
  readonly jobsButtons: ReadonlyArray<DispatchJobButtonProps>;
  readonly loginForDownload?: boolean;
  readonly accessibility?: Accessibility;
  readonly rootPath?: string;
  readonly index: string;
  readonly totalCount: number;
  readonly fields: ReadonlyArray<string>;
  readonly filter: FilterSet;
  readonly sort?: string[];
}

const DownloadsPanel = ({
  dropdowns,
  buttons,
  jobsButtons,
  loginForDownload,
  index,
  totalCount,
  fields,
  filter,
  accessibility,
}: DownloadsPanelProps): JSX.Element => {
  const isUserLoggedIn = useCoreSelector((state) =>
    isAuthenticated(selectUserAuthStatus(state)),
  );

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
              buttons: dropdown.dropdownItems?.map((button) => ({
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
  }, [dropdowns, loginRequired, isUserLoggedIn]);

  const submitJobsButtons = useDeepCompareMemo(() => {
    return jobsButtons.map((button) => {
      console.log('jobs', button);
      let disabled = button?.enabled === undefined ? false : !button.enabled;
      console.log('disabled', disabled);
      if (loginRequired && !isUserLoggedIn) {
        disabled = true;
      }

      return (
        <CohortSubmitJobActionButton
          label={button.title}
          activeText={'Submitting...'}
          inactiveText={button.title}
          tooltipText={button.tooltipText}
          disabled={disabled}
          actions={button.actions}
          jobParameters={{
            index,
            totalCount,
            fields,
            filter,
            accessibility: accessibility ?? Accessibility.ALL,
            // sort: sort, // TODO add sort
          }}
          key={button.title}
        />
      );
    });
  }, [jobsButtons, loginRequired, isUserLoggedIn]);

  const actionButtons = useDeepCompareMemo(() => {
    return buttons.map((button) => {
      let disabled = false;
      let actionFunction = NullButtonAction;
      let actionArgs = {};
      const buttonAction = button.action ?? button.type;
      if (buttonAction) {
        const actionItem = findButtonAction(buttonAction);
        if (actionItem) {
          const funcArgs = actionItem.args ?? {};
          actionFunction = actionItem.action;
          actionArgs = funcArgs ?? ({} as Record<string, any>);
        }
      }
      if (loginRequired && !isUserLoggedIn) {
        disabled = true;
      }

      return (
        <CohortActionButton
          activeText={'Downloading...'}
          inactiveText={button.title}
          tooltipText={button.tooltipText}
          disabled={disabled || !button.enabled}
          actionFunction={actionFunction}
          actionArgs={{
            ...actionArgs,
            ...(button.actionArgs ?? ({} as Record<string, any>)),
            type: index,
            totalCount,
            fields,
            filter,
            accessibility: accessibility ?? Accessibility.ALL,
            // sort: sort, // TODO add sort
          }}
          key={button.title}
        />
      );
    });
  }, [buttons, loginRequired, isUserLoggedIn]);

  return dropdowns || buttons || jobsButtons ? (
    <div className="flex space-x-1">
      {Object.values(dropdownsToRender).map(
        (dropdown: DropdownsWithButtonsProps) => {
          return createDownloadMenuButton(dropdown, {
            type: index,
            totalCount,
            fields,
            filter,
            accessibility: accessibility ?? Accessibility.ALL,
            // sort: sort, // TODO add sort
          });
        },
      )}

      {actionButtons}
      {submitJobsButtons}
    </div>
  ) : (
    <React.Fragment></React.Fragment>
  );
};

export default DownloadsPanel;
