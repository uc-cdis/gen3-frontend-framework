export const isArrayOfString = (value: any): value is Array<string> => {
  return (
    Array.isArray(value) &&
    value.every((element) => typeof element === 'string')
  );
};
