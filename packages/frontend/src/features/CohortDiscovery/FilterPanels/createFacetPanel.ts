import { AggregationsData, FacetDefinition } from '@gen3/core';


export const createFacetPanel = (facet: FacetDefinition, chartType: string, data: AggregationsData) => {
  switch (facet.type) {
    case 'enum' :
      return <EnumFacetPanel >
  }
}
