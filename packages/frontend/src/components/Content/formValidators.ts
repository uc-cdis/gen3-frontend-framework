import type { JSONObject } from "@gen3/core";
import { toString } from "lodash";

type Validator = (value: unknown) => string | null;
type AsyncValidator = (
  value: unknown,
  values?: JSONObject,
  path?: string,
  signal?: AbortSignal,
) => Promise<string | null>;

/* CEDAR ID VALIDATION */
const CEDAR_UUID_REGEX =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;

const validateCedarUUID = (
  errorText: string = 'Invalid Cedar User UUID',
): Validator => {
  return (value: unknown) => {
    if (!value || toString(value).trim() === '') return null;
    return CEDAR_UUID_REGEX.test(toString(value)) ? null : errorText;
  };
};

const isCedarUUIDValid = (
  errorText: string = 'Valid Cedar User UUID required',
): Validator => {
  return (value: unknown) => {
    if (!value || toString(value).trim() === '') return errorText;
    return validateCedarUUID(errorText)(value);
  };
};

/* CLINICAL TRIALS GOV ID VALIDATION */
const validateClinicalTrialID = (
  errorText: string = 'Invalid ClinicalTrials.gov ID',
): AsyncValidator => {
  return async (value: unknown, _, __, signal?: AbortSignal) => {
    const ctID = toString(value || '').trim();
    if (!ctID) return null; // Pass empty values for optional fields
    try {
      const resp = await fetch(
        `https://clinicaltrials.gov/api/v2/studies/${ctID}?fields=NCTId`,
        { signal }, // Pass Mantine's AbortSignal to cancel stale requests
      );
      if (!resp.ok) return 'Unable to verify ClinicalTrials.gov ID';
      const respJson = await resp.json();
      if (respJson?.protocolSection?.identificationModule?.nctId === ctID) {
        return null; // Valid
      }
      return errorText;
    } catch (error: unknown) {
      if (error instanceof Error && error?.name === 'AbortError') return null; // Request canceled by newer blur/change event
      return 'Unable to verify ClinicalTrials.gov ID';
    }
  };
};

// Required check (returns error if empty OR invalid)
const isClinicalTrialIDValid = (
  errorText: string = 'Valid ClinicalTrials.gov ID required',
): AsyncValidator => {
  return async (value: unknown, values, path, signal) => {
    if (!value || toString(value).trim() === '') return errorText;
    return validateClinicalTrialID(errorText)(value, values, path, signal);
  };
};

export { isCedarUUIDValid, isClinicalTrialIDValid };
