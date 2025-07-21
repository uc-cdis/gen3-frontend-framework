import { DetailsPanelComponentProps } from '../../../../components/Details/types';
import { SummaryTable } from '../types';
import { Accessibility } from '@gen3/core';
import { StudyPageConfig } from '../../../Study/types';

export interface TableDetailsPanelProps extends DetailsPanelComponentProps {
  index: string;
  tableConfig: SummaryTable;
  accessibility: Accessibility;
}

/**
 * Represents the configuration for the Explorer details.
 *
 * @interface ExplorerDetailsConfig
 * @property {('click' | 'doubleclick' | 'expand')} [mode] - The interaction mode for the Explorer details. Default is 'click'.
 * @property {string} [title] - The title of the Explorer details.
 * @property {string} panel - The panel name for the Explorer details that has been registered with the appropriate factory
 * @property {Record<string, unknown>} [params] - Additional parameters for the Explorer details panel.
 * @property {Record<string, string>} [classNames] - Additional CSS class names for the Explorer modal | drawer.
 * @property {string} [idField] - The field used as an identifier for the Explorer details.
 */
export interface ExplorerDetailsConfig {
  mode?: 'click' | 'doubleclick' | 'expand' | 'none';
  title?: string;
  panel: string;
  panelContainer?: 'modal' | 'drawer';
  params?: Record<string, unknown>;
  classNames?: Record<string, string>;
  idField?: string; // field containing the unique id
  dataPath?: string; // the path to the returned data object.
  simpleDetailsView?: StudyPageConfig; // simple detailed view similar to Discovery
}
