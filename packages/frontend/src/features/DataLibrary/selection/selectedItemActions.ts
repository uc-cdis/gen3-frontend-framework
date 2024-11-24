import { CohortItem } from '@gen3/core';
import { FileItemWithParentDatasetNameAndID, SelectableItem } from '../types';

export type SelectableItems = Array<SelectableItem>;

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

export interface ActionConfig {
  id: string;
  label: string;
  itemRules?: Rule[];
  groupRules?: GroupRule[];
}

export type ActionsConfig = ReadonlyArray<ActionConfig>;

const isArrayField = (value: unknown): value is Array<unknown> =>
  Array.isArray(value);

const isNumeric = (value: unknown): value is number =>
  typeof value === 'number' && !isNaN(value);

export const evaluateItemRule = (
  rule: Rule,
  item: SelectableItems,
): boolean => {
  switch (rule.operator) {
    case 'equals':
    case 'not': {
      const fieldValue = item[rule.field];
      return rule.operator === 'equals'
        ? fieldValue === rule.value
        : fieldValue !== rule.value;
    }
    case 'includes':
    case 'excludes': {
      const fieldValue = item[rule.field];
      if (!isArrayField(fieldValue)) return false;

      return rule.operator === 'includes'
        ? fieldValue.includes(rule.value)
        : !fieldValue.includes(rule.value);
    }
    case 'greater':
    case 'less': {
      const fieldValue = item[rule.field];
      if (isNumeric(fieldValue) && isNumeric(rule.value))
        return rule.operator === 'greater'
          ? fieldValue > rule.value
          : fieldValue < rule.value;
      return false;
    }
    default:
      return false;
  }
};

const evaluateGroupRule = (
  rule: GroupRule,
  items: SelectableItems,
): boolean => {
  switch (rule.operator) {
    case 'count': {
      const fieldValue = items.map((item) => item[rule.field]);
      return fieldValue.length === rule.total;
    }
  }
};

/**
 * Retrieves an action configuration from a set of actions by its unique identifier.
 *
 * @param {ActionsConfig} actions - An array of action configurations.
 * @param {string} id - The unique identifier of the desired action configuration.
 * @returns {ActionConfig | undefined} The action configuration with the matching identifier, or undefined if not found.
 */
export const getActionById = (
  actions: ActionsConfig,
  id: string,
): ActionConfig | undefined => {
  return actions.find((action) => action.id === id);
};

export const doesItemFailRule = (
  item: CohortItem | FileItemWithParentDatasetNameAndID,
  action: ActionConfig,
): string[] => {
  return (
    action?.itemRules?.reduce((acc: string[], rule) => {
      if (!evaluateItemRule(rule, item)) {
        acc.push(rule.message);
      }
      return acc;
    }, []) ?? []
  );
};

export const doesGroupFailRule = (
  items: Array<SelectableItem>,
  action: ActionConfig,
): string[] => {
  return (
    action?.groupRules?.reduce((acc: string[], rule) => {
      if (!evaluateGroupRule(rule, items)) {
        acc.push(rule.message);
      }
      return acc;
    }, []) ?? []
  );
};
