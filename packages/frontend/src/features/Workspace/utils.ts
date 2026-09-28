export const PaymentNumberToString = (
  x: number | undefined,
  undefinedValue = 'N/A',
  precision = 2,
): string => {
  if (typeof x !== 'number' || Number.isNaN(x)) return undefinedValue;

  return x.toFixed(precision);
};
