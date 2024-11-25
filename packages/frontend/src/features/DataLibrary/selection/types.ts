import { CohortItem } from '@gen3/core';
import { FileItemWithParentDatasetNameAndID } from '../types';

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
  parameters?: Record<string, unknown>;
  itemRules?: ItemRule[];
  groupRules?: GroupRule[];
}

export type ActionsConfig = ReadonlyArray<DataLibraryActionConfig>;
