// set of interfaces which follows the current explorer configuration

import { SummaryChart } from '../../components/charts';
import { SummaryTable } from './ExplorerTable/types';
import { FieldToName } from '../../components/facets/types';
import { DownloadButtonProps } from '../../components/Buttons/DropdownButtons';
import { Dispatch, SetStateAction } from 'react';
import { Modals, FacetDefinition } from '@gen3/core';
import { StylingOverride } from '../../types/styling';

export type FacetType =
  | 'enum'
  | 'range'
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime';

export interface TabConfig {
  title: string;
  fields: ReadonlyArray<string>;
  fieldsConfig: Record<string, FacetDefinition>;
  classNames?: StylingOverride;
}

export interface TabsConfig {
  readonly tabs: ReadonlyArray<TabConfig>;
}

export interface ManifestFieldsConfig {
  resourceIndexType: string;
  resourceIdField: string;
  referenceIdFieldInResourceIndex: string;
  referenceIdFieldInDataIndex: string;
}

export interface DataTypeConfig {
  dataType: string;
  nodeCountTitle: string;
  fieldMapping: ReadonlyArray<FieldToName>;
  accessibleFieldCheckList?: string[];
  accessibleValidationField?: string;
  tierAccessLevel?: 'libre' | 'regular' | 'private'; // TODO See if guppy can serve this
  tierAccessLimit?: number; // TODO: same
}

export interface DataTypeConfigWithManifest extends DataTypeConfig {
  manifestMapping?: ManifestFieldsConfig;
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
  readonly guppyConfig: DataTypeConfigWithManifest; // guppy config
  readonly tabTitle: string; // title of the tab
  readonly charts?: Record<string, SummaryChart>; // grid of charts
  readonly table?: SummaryTable; // table configuration
  readonly filters?: TabsConfig; // filters for the fields
  readonly dropdowns?: Record<string, DropdownsWithButtonsProps>; // dropdown menu of action buttons
  readonly buttons?: ReadonlyArray<DownloadButtonConfig>; // row of action buttons
  readonly loginForDownload?: boolean; // login required for download
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

export interface DownloadButtonPropsWithAction
  extends Omit<DownloadButtonProps, 'action' | 'actionArgs'> {
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
