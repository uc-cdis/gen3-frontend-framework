export const validateObjectHasRequiredFields = (
  obj: any,
  requiredFields: string[],
) => requiredFields.every((field) => obj[field] !== undefined);
