
// set of interfaces which follows the current explorer configuration

import { SummaryChart } from '../../components/charts';
import { SummaryTable } from './ExplorerTable/types';
import { FieldToName } from '../../components/facets/types';
import { DownloadButtonProps } from '../../components/Buttons/DropdownButtons';
import { Dispatch, SetStateAction } from 'react';
import { Modals } from '@gen3/core';

export interface TabConfig {
    readonly title: string;
    readonly fields: ReadonlyArray<string>;
}

export interface TabsConfig {
    readonly tabs: ReadonlyArray<TabConfig>;
}

export interface DataTypeConfig {
    readonly dataType: string;
    readonly nodeCountTitle: string;
    readonly fieldMapping: ReadonlyArray<FieldToName>;
}

export interface DownloadButtonConfig extends DownloadButtonProps {
    dropdownId?: string;
}

export interface DropdownButtonsConfig {
    readonly title: string;
}

export interface DropdownsWithButtonsProps extends DropdownButtonsConfig {
    dropdownItems: ReadonlyArray<DownloadButtonProps>;
}

export interface CohortPanelConfig {
    readonly guppyConfig: DataTypeConfig;
    readonly tabTitle: string;
    readonly charts?: Record<string, SummaryChart>;
    readonly table?: SummaryTable;
    readonly filters?: TabsConfig;
    readonly dropdowns?: Record<string, DropdownsWithButtonsProps>;
    readonly buttons?: ReadonlyArray<DownloadButtonConfig>;
    readonly loginForDownload?: boolean;
}

export interface CohortBuilderConfiguration {
    explorerConfig: Array<CohortPanelConfig>;
}

// to do add buttons, options,  menus, etc

export interface CohortConfig {
    tabs: TabConfig[];
}

export enum DownloadFileFormats {
    JSON = 'JSON',
    CSV = 'CSV',
    TSV = 'TSV',
    DATA = 'DATA',
    UNDEFINED = 'UNDEFINED',
}

export type ActionButtonFunction = (
  done?: () => void,
  onError?: (error: Error) => void,
  onAbort?: () => void,
  signal?: AbortSignal,
) => Promise<void>;

export type ActionButtonWithArgsFunction = (
  params: Record<string, any>,
  done?: () => void,
  onError?: (error: Error) => void,
  onAbort?: () => void,
  signal?: AbortSignal,
) => Promise<void>;


export interface DownloadButtonPropsWithAction extends Omit<DownloadButtonProps, 'action' |'actionArgs'> {
    actionFunction: ActionButtonWithArgsFunction;
    actionArgs: Record<string, any>;

}

export interface GuppyActionButtonProps {
    disabled?: boolean;
    inactiveText: string;
    activeText: string;
    customStyle?: string;
    showLoading?: boolean;
    showIcon?: boolean;
    preventClickEvent?: boolean;
    onClick?: () => void;
    setActive?: Dispatch<SetStateAction<boolean>>;
    active?: boolean;
    Modal403?: Modals;
    Modal400?: Modals;
    tooltipText?: string;
    done?: () => void;
    actionFunction: ActionButtonWithArgsFunction;
    actionArgs: Record<string, any>;
    customErrorMessage?: string;
    hideNotification?: boolean;
}
