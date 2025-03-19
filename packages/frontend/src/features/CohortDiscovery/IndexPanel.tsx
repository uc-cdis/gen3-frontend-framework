import React, { useMemo, useState } from 'react';
import { useDeepCompareCallback, useDeepCompareEffect } from 'use-deep-compare';
import { Flex, Stack, Center, Box, Title, Text } from '@mantine/core';
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
import ActionButtonGroup from './ActionButtons/ActionButtonGroup';
import CohortManager from '../CohortDiscovery/CohortManager';
import { AppState, useAppSelector, useAppDispatch } from './appApi';
import Image from 'next/image';
import {
  selectSelectedFacetsFromIndex,
  removeFacetSelection,
  addFacetSelection,
} from './SelectedFacetsSlice';

const IndexPanel = ({
  dataConfig,
  tabs,
  tabTitle,
  emptySelection,
}: CohortDiscoveryGroup) => {
  const [activeFieldDefinitions, setActiveFieldDefinitions] = useState<
    Array<FacetDefinition>
  >([]);

  const appDispatch = useAppDispatch();

  const index = dataConfig.dataType;
  const fields = useMemo(
    () => getAllFieldsFromFilterConfigs(tabs ?? []),
    [tabs],
  );

  const [facetDefinitions, setFacetDefinitions] = useState<
    Record<string, FacetDefinition>
  >({});

  const [categories, setCategories] = useState<TabConfig[]>([]);

  const selectedFacets: string[] =
    useAppSelector((state: AppState) =>
      selectSelectedFacetsFromIndex(state, index),
    ) ?? [];

  /**
   * When selection changes, update active list of FacetDefinitions
   */
  useDeepCompareEffect(() => {
    const selectFacetDefinitions = selectedFacets.reduce((acc, field) => {
      if (field in facetDefinitions) {
        acc.push(facetDefinitions[field]);
      }
      return acc;
    }, [] as Array<FacetDefinition>);
    setActiveFieldDefinitions(selectFacetDefinitions);
  }, [selectedFacets, facetDefinitions]);

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
    (field: string, checked: boolean) => {
      if (!checked) {
        appDispatch(removeFacetSelection({ index, field }));
      }
      if (checked) {
        appDispatch(addFacetSelection({ index, field }));
      }
    },
    [selectedFacets, index, appDispatch],
  );

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
      <Flex className="flex h-full bg-base-light pb-4 ml-4">
        <FacetSelectionPanel
          categories={categories}
          selectedFields={selectedFacets}
          updateSelectedField={updateFields}
          hooks={{
            useClearFilter: () => (field: string) => null,
            useToggleExpandFilter: useToggleExpandFilter,
            useFilterExpanded: useFilterExpandedState,
          }}
        />
        <Stack className="w-full">
          <ActionButtonGroup index={index} />
          {selectedFacets.length > 0 ? (
            <ChartsAndFacetsPanel
              index={index}
              facets={activeFieldDefinitions}
            />
          ) : (
            <Center className="h-full mx-2 bg-base-max">
              <Box className="text-center m-4">
                <Image
                  src={`/images/apps/${emptySelection.image}`}
                  alt={emptySelection.imageAlt}
                  width={240}
                  height={240}
                  className="inline-block mb-4"
                />
                {/*TODO make config file for tabs*/}
                <Title order={3}>{emptySelection.title || ''}</Title>
                <Text>{emptySelection.subHead || ''}</Text>
              </Box>
            </Center>
          )}
        </Stack>
      </Flex>
    </Stack>
  );
};

export default IndexPanel;
