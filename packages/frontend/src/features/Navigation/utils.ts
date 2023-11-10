export const extractClassName = (
  key: string,
  classNames: Record<string, string>,
): string => {
  if (typeof classNames === 'object' && key in classNames) {
    return classNames[key];
  }
  return '';
};
