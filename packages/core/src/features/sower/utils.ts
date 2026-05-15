import { JobActionFunctionConfig } from './types';

export function isJobActionFunctionConfig(
  value: unknown,
): value is JobActionFunctionConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as JobActionFunctionConfig).actionName === 'string' &&
    typeof (value as JobActionFunctionConfig).parameters === 'object' &&
    (value as JobActionFunctionConfig).parameters !== null
  );
}
