import { CohortItem } from '@gen3/core';
import { FileItemWithParentDatasetNameAndID } from '../types';

type SelectableItems = Array<CohortItem | FileItemWithParentDatasetNameAndID>;

type RuleOperator =
  | 'equals'
  | 'not'
  | 'includes'
  | 'excludes'
  | 'greater'
  | 'less';

// Enforce type safety for rule values
type RuleValue = string | number | boolean;

// Ensure field exists on items
type ValidField<T> = keyof T;
type CommonFields = ValidField<CohortItem> &
  ValidField<FileItemWithParentDatasetNameAndID>;

interface Rule {
  field: CommonFields;
  operator: RuleOperator;
  value: RuleValue;
}

export interface ActionConfig {
  id: string;
  label: string;
  rules: Rule[];
}

export type ActionsConfig = ReadonlyArray<ActionConfig>;

const isArrayField = (value: unknown): value is Array<unknown> =>
  Array.isArray(value);

const isNumeric = (value: unknown): value is number =>
  typeof value === 'number' && !isNaN(value);

export const evaluateRule = (rule: Rule, items: SelectableItems): boolean => {
  // Early return if no items
  if (items.length === 0) return false;

  // Validate all items have the field
  if (!items.every((item) => rule.field in item)) {
    return false;
  }

  switch (rule.operator) {
    case 'equals':
    case 'not': {
      const compareResult = items.every((item) => {
        const fieldValue = item[rule.field];
        return rule.operator === 'equals'
          ? fieldValue === rule.value
          : fieldValue !== rule.value;
      });
      return compareResult;
    }

    case 'includes':
    case 'excludes': {
      return items.every((item) => {
        const fieldValue = item[rule.field];
        if (!isArrayField(fieldValue)) return false;

        return rule.operator === 'includes'
          ? fieldValue.includes(rule.value)
          : !fieldValue.includes(rule.value);
      });
    }

    case 'greater':
    case 'less': {
      return items.every((item) => {
        const fieldValue = item[rule.field];
        if (isNumeric(fieldValue) && isNumeric(rule.value))
          return rule.operator === 'greater'
            ? fieldValue > rule.value
            : fieldValue < rule.value;
        return false;
      });
    }
    default:
      return false;
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
    if (!evaluateRule(rule, items)) {
      errors.push(
        `Rule failed: ${rule.field} ${rule.operator} ${rule.value} (${typeof rule.value})`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const getAvailableActions = (
  actions: ReadonlyArray<ActionConfig>,
  items: SelectableItems,
): ActionConfig[] => {
  return actions.filter((action) => validateAction(action, items).valid);
};
