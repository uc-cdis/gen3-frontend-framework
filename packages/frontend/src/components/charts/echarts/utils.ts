export const filterMissing = (facetData: any) =>
  facetData.filter((d: any) => d.key !== '_missing');
