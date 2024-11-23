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
  itemRules: Rule[];
  groupRules: GroupRule[];
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

export const validateAction = (
  action: ActionConfig | undefined,
  items: SelectableItems,
): { valid: boolean; errors: string[] } => {
  if (!action) {
    return { valid: false, errors: ['Action not found'] };
  }

  if (items.length === 0) {
    return { valid: false, errors: ['No items to validate'] };
  }

  const errors: string[] = [];

  for (const rule of action.rules) {
    if (!evaluateItemRule(rule, items)) {
      errors.push(
        rule.errorMessage ??
          `Rule failed: ${rule.field} ${rule.operator} ${rule.value} (${typeof rule.value})`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
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

/**
 * Filters a list of action configurations based on their validity for the provided items.
 *
 * @param {ReadonlyArray<ActionConfig>} actions - An array of action configurations to evaluate.
 * @param {SelectableItems} items - A collection of items to validate actions against.
 * @returns {ActionConfig[]} An array of action configurations that are valid for the given items.
 */
export const getAvailableActions = (
  actions: ReadonlyArray<ActionConfig>,
  items: SelectableItems,
): ActionConfig[] => {
  return actions.filter((action) => validateAction(action, items).valid);
};

type ValidatedItem = {
  item: SelectableItem;
  failedAction?: ActionConfig;
};

export const doesItemFailRule = (
  item: CohortItem | FileItemWithParentDatasetNameAndID,
  action: ActionConfig,
): boolean => {
  return action.itemRules.some((rule) => !evaluateItemRule(rule, item));
};

export const doesGroupFailRule = (
  items: Array<SelectableItem>,
  action: ActionConfig,
): boolean => {
  return action.groupRules.some((rule) => !evaluateGroupRule(rule, items));
};

/**
 * Identifies the items that fail a given action based on specified rules.
 *
 * @param {ActionConfig} action - The configuration of the action to be tested.
 * @param {SelectableItems} items - A collection of items to be evaluated against the action.
 * @returns {Array<ValidatedItem>} An array of results containing the items that failed the action and the corresponding action.
 */
export const getFailedActionsForItems = (
  action: ActionConfig,
  items: SelectableItems,
): Array<ValidatedItem> => {
  // Iterate over each item and test action, for ones that fail add action to
  // item otherwise just add the item
  return items.reduce((acc, item) => {
    if (doesItemFailRule(item, action)) {
      acc.push({ item, failedAction: action });
    } else {
      acc.push({ item });
    }
    return acc;
  }, [] as ValidatedItem[]);
};
