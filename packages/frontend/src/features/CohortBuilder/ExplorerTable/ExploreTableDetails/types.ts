import { DetailsPanelComponentProps } from '../../../../components/Details/types';
import { SummaryTable } from '../types';

export interface TableDetailsPanelProps extends DetailsPanelComponentProps {
  index: string;
  tableConfig: SummaryTable;
}

export interface ExplorerDetailsConfig {
  renderer: string;
  mode?: 'click' | 'doubleclick' | 'expand';
  title?: string;
  params?: Record<string, unknown>;
  classNames?: Record<string, string>;
  idField?: string;
}
