type RecordType = Record<string, string>;

const mergeValues = (defaultValue: string, userValue: string): string => `${defaultValue} ${userValue}`;

export const mergeDefaultValues = (defaultValues: RecordType, userValues: RecordType, merge = true): RecordType => {
  const defaultKeys = Object.keys(defaultValues);
  const mergedValues = { ...defaultValues, ...userValues };

  if (merge) {
    defaultKeys.forEach(key => {
      if (userValues[key]) {
        mergedValues[key] = mergeValues(defaultValues[key], userValues[key]);
      }
    });
  }

  return mergedValues;
};
