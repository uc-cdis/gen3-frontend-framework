// from https://stackoverflow.com/questions/33053310/remove-value-from-object-without-mutation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const removeKey = (
  key: string | number,
  { [key]: _, ...rest },
): Record<string | number, any> => rest;
