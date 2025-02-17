import { CohortItem, HTTPError } from '@gen3/core';
import {
  FileItemWithParentDatasetNameAndID,
  ValidatedSelectedItem,
} from '../types';

type RuleOperator =
  | 'equals'
  | 'not'
  | 'includes'
  | 'excludes'
  | 'greater'
  | 'less';
type GroupOperator = 'count';
// Enforce type safety for rule values
type RuleValue = string | number | boolean;
// Ensure field exists on items
type ValidField<T> = keyof T;
type CommonFields = ValidField<CohortItem> &
  ValidField<FileItemWithParentDatasetNameAndID>;

export interface ItemRule {
  field: CommonFields;
  operator: RuleOperator;
  value: RuleValue;
  errorMessage: string;
}

export interface GroupRule extends Omit<ItemRule, 'operator'> {
  operator: GroupOperator;
  total: RuleValue;
}

export interface DataLibraryActionConfig {
  id: string;
  label: string;
  rightIcon?: string;
  leftIcon?: string;
  buttonLabel: string;
  actionFunction: string;
  parameters?: Record<string, unknown>;
  itemRules?: ItemRule[];
  groupRules?: GroupRule[];
}

export type DataLibraryActionsConfig = ReadonlyArray<DataLibraryActionConfig>;

export type DataActionFunction<T = void> = (
  validatedSelections: ReadonlyArray<ValidatedSelectedItem>,
  params?: Record<string, any>, // function options from the config
  done?: (arg0?: string) => void,
  onError?: (error: HTTPError | Error) => void,
  onAbort?: () => void,
  signal?: AbortSignal,
) => Promise<T>;
