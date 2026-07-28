type Validator = (value: unknown) => string | null;

const CEDAR_UUID_REGEX =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;

const validateCedarUUID = (
  errorText: string = 'Invalid Cedar User UUID',
): Validator => {
  return (value: unknown) => {
    if (!value || String(value).trim() === '') return null;
    return CEDAR_UUID_REGEX.test(String(value)) ? null : errorText;
  };
};

const isRequiredCedarUUID = (
  errorText: string = 'Valid Cedar User UUID required',
): Validator => {
  return (value: unknown) => {
    if (!value || String(value).trim() === '') return errorText;
    return validateCedarUUID(errorText)(value);
  };
};

export { validateCedarUUID, isRequiredCedarUUID };
