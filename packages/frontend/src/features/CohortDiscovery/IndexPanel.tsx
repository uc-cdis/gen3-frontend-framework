import React, { useMemo, useState } from 'react';
import { useDeepCompareCallback, useDeepCompareEffect } from 'use-deep-compare';
import { Flex, Stack } from '@mantine/core';
import FacetSelectionPanel from './FacetSelectionPanel';
import { useFilterExpandedState, useToggleExpandFilter } from './hooks';

import { FacetDefinition, useGetAggsQuery } from '@gen3/core';

import { selectIndexFilters } from './CohortSelectors';
import { CohortDiscoveryGroup } from './types';
import {
  getAllFieldsFromFilterConfigs,
  classifyFacets,
} from '../../components/facets';
import { TabConfig } from '../CohortBuilder/types';
import { ErrorCard } from '../../components/MessageCards';
import ChartsAndFacetsPanel from './ChartsAndFacetsPanel';
import ActionButtonGroup from './ActionButtonGroup';
import CohortManager from '../CohortBuilder/CohortManager/CohortManager';
import { AppState, useAppSelector } from './appApi';

const IndexPanel = ({ dataConfig, tabs, tabTitle }: CohortDiscoveryGroup) => {
  const [activeFieldDefinitions, setActiveFieldDefinitions] = useState<
    Array<FacetDefinition>
  >([]);

  const index = dataConfig.dataType;
  const fields = useMemo(
    () => getAllFieldsFromFilterConfigs(tabs ?? []),
    [tabs],
  );

  const [facetDefinitions, setFacetDefinitions] = useState<
    Record<string, FacetDefinition>
  >({});

  const [categories, setCategories] = useState<TabConfig[]>([]);

  const cohortFilters = useAppSelector((state: AppState) =>
    selectIndexFilters(state, index),
  );

  const queryFields =
    categories.length === 0
      ? fields
      : activeFieldDefinitions.map((x) => x.field);
  const {
    data,
    isSuccess,
    isError: isAggsQueryError,
  } = useGetAggsQuery(
    {
      type: index,
      fields: queryFields,
      filters: cohortFilters,
    },
    { skip: queryFields.length === 0 },
  );

  const updateFields = useDeepCompareCallback(
    (field: string) => {
      if (activeFieldDefinitions.some((facetDef) => facetDef.field === field)) {
        setActiveFieldDefinitions((prevState) => {
          return prevState.filter((f) => f.field !== field);
        });
      } else {
        setActiveFieldDefinitions((prevState) => [
          ...prevState,
          facetDefinitions[field],
        ]);
      }
    },
    [activeFieldDefinitions, facetDefinitions],
  );

  // Set the facet definitions based on the data only the first time the data is loaded
  useDeepCompareEffect(() => {
    if (isSuccess && Object.keys(facetDefinitions).length === 0) {
      const configFacetDefs = tabs.reduce(
        (acc: Record<string, FacetDefinition>, tab) => {
          return { ...tab.fieldsConfig, ...acc };
        },
        {},
      );

      const facetDefs = classifyFacets(data, index, [], configFacetDefs);
      setFacetDefinitions(facetDefs);
      // setup categories

      const categories = tabs.reduce((acc, tab) => {
        const updatedTab = tab;
        if (!updatedTab?.fieldsConfig) {
          updatedTab.fieldsConfig = {};
        }
        updatedTab.fields.forEach((x) => {
          tab.fieldsConfig[x] = {
            ...tab.fieldsConfig[x],
            ...(x in facetDefs ? facetDefs[x] : {}),
          };
        });

        acc.push(updatedTab);
        return acc;
      }, [] as TabConfig[]);
      setCategories(categories);
    }
  }, [isSuccess, data, facetDefinitions, index]);

  if (isAggsQueryError) {
    return <ErrorCard message="Unable to fetch data from server" />;
  }

  return (
    <Stack>
      <CohortManager index={index} />
      <Flex className="w-full h-full bg-base-light">
        <FacetSelectionPanel
          categories={categories}
          selectedFields={activeFieldDefinitions.map((x) => x.field)}
          updateSelectedField={updateFields}
          hooks={{
            useClearFilter: () => (field: string) => null,
            useToggleExpandFilter: useToggleExpandFilter,
            useFilterExpanded: useFilterExpandedState,
          }}
        />
        <Stack className="w-full">
          <ActionButtonGroup />
          <ChartsAndFacetsPanel index={index} facets={activeFieldDefinitions} />
        </Stack>
      </Flex>
    </Stack>
  );
};

export default IndexPanel;
