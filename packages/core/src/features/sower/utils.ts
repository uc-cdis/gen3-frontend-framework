import type {
  CreateAndExportOutputConfig,
  JobActionFunctionConfig,
} from './types';

export function isJobActionFunctionConfig(
  value: unknown,
): value is JobActionFunctionConfig {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.name === 'string' &&
    (candidate.parameters === undefined ||
      (typeof candidate.parameters === 'object' &&
        candidate.parameters !== null))
  );
}

export function isCreateAndExportOutputConfig(
  value: unknown,
): value is CreateAndExportOutputConfig {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    'jobAction' in candidate &&
    isJobActionFunctionConfig(candidate.jobAction) &&
    (candidate.outputAction === undefined ||
      isJobActionFunctionConfig(candidate.outputAction))
  );
}
