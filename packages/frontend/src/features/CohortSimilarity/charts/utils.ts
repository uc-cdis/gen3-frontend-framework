export const roundTo2AfterDecimal = (number: number) => {
  return Math.round((number + Number.EPSILON) * 100) / 100;
};
