import React, { useMemo, useState } from 'react';
import {
  useDeepCompareCallback,
  useDeepCompareEffect,
  useDeepCompareMemo,
} from 'use-deep-compare';
import { getAllFieldsFromFilterConfigs } from '../../components/facets/utils';

import {
  CoreState,
  FacetDefinition,
  selectIndexFilters,
  useCoreSelector,
  useGetAggsQuery,
} from '@gen3/core';
import { CohortDiscoveryGroup } from './types';
import { classifyFacets } from '../../components/facets/utils';

const IndexPanel = ({
  guppyConfig,
  filters,
  tabTitle,
}: CohortDiscoveryGroup) => {
  const [controlsExpanded, setControlsExpanded] = useState(true);
  const [activeFields, setActiveFields] = useState<string[]>([]); // the fields that have been selected by the user

  const index = guppyConfig.dataType;
  const fields = useMemo(
    () => getAllFieldsFromFilterConfigs(filters?.tabs ?? []),
    [filters?.tabs],
  );

  const [facetDefinitions, setFacetDefinitions] = useState<
    Record<string, FacetDefinition>
  >({});

  const cohortFilters = useCoreSelector((state: CoreState) =>
    selectIndexFilters(state, index),
  );

  const {
    data,
    isSuccess,
    isError: isAggsQueryError,
  } = useGetAggsQuery({
    type: index,
    fields: fields,
    filters: cohortFilters,
  });

  const updateFields = useDeepCompareCallback(
    (field: string) => {
      if (activeFields.includes(field)) {
        setActiveFields(activeFields.filter((f) => f !== field));
      } else {
        setActiveFields([...activeFields, field]);
      }
    },
    [activeFields],
  );

  // Set the facet definitions based on the data only the first time the data is loaded
  useDeepCompareEffect(() => {
    if (isSuccess && Object.keys(facetDefinitions).length === 0) {
      const configFacetDefs = filters?.tabs.reduce(
        (acc: Record<string, FacetDefinition>, tab) => {
          return { ...tab.fieldsConfig, ...acc };
        },
        {},
      );

      const facetDefs = classifyFacets(
        data,
        index,
        guppyConfig.fieldMapping,
        configFacetDefs ?? {},
      );
      setFacetDefinitions(facetDefs);

      // setup summary charts since nested fields can be listed by the split field name
    }
  }, [isSuccess, data, facetDefinitions, index, guppyConfig.fieldMapping]);

  return <div></div>;
};

export default IndexPanel;
