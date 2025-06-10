import { HistogramData } from '@gen3/core';
import { CohortDiscoveryConfig, IndexResourceField } from './types';

export const EnumFacetToHistogramArray = (
  data?: Record<string, number>,
): Array<HistogramData> => {
  if (!data) return [];

  return Object.entries(data).reduce((acc, [key, count]) => {
    acc.push({ key, count });
    return acc;
  }, [] as Array<HistogramData>);
};

export const extractIndexResourceFromConfiguration = (
  config: CohortDiscoveryConfig,
): IndexResourceField => {
  return config.dataIndexes.reduce((acc: IndexResourceField, panelConfig) => {
    acc[panelConfig.dataConfig.dataType] = {
      resourceField: panelConfig.resourceField,
      resourcePath: panelConfig.resourcePath,
    };
    return acc;
  }, {});
};
