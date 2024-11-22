import { CohortItem } from '@gen3/core';
import { FileItemWithParentDatasetNameAndID } from '../types';

type SelectableItems = Array<CohortItem | FileItemWithParentDatasetNameAndID>;

// Rule types
type RuleOperator =
  | 'equals'
  | 'not'
  | 'includes'
  | 'excludes'
  | 'greater'
  | 'less';

interface Rule {
  field: string;
  operator: RuleOperator;
  value: any;
}

interface ActionConfig {
  id: string;
  name: string;
  rules: Rule[];
}

type ActionsConfig = Record<string, ActionConfig>;

export const evaluateRule = (rule: Rule, items: SelectableItems): boolean => {
  switch (rule.operator) {
    case 'equals':
      return items.every((item) => item[rule.field] === rule.value);
    case 'not':
      return items.every((item) => item[rule.field] !== rule.value);
    case 'includes':
      return items.every(
        (item) =>
          item[rule.field] &&
          Array.isArray(item[rule.field]) &&
          (item[rule.field] as Array<unknown>).includes(rule.value),
      );
    case 'excludes':
      return items.every(
        (item) =>
          item[rule.field] &&
          Array.isArray(item[rule.field]) &&
          !(item[rule.field] as Array<unknown>).includes(rule.value),
      );
    case 'greater':
      return items.every((item) => item[rule.field] > rule.value);
    case 'less':
      return items.every((item) => item[rule.field] < rule.value);
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

  const errors: string[] = [];

  for (const rule of action.rules) {
    if (!evaluateRule(rule, items)) {
      errors.push(`Rule failed: ${rule.field} ${rule.operator} ${rule.value}`);
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
