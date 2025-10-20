import React, { useMemo, useState } from 'react';
import { useDeepCompareCallback, useDeepCompareEffect } from 'use-deep-compare';
import { Box, Center, Flex, Stack, Text, Title } from '@mantine/core';
import FacetSelectionPanel from './FacetSelectionPanel';
import { useFilterExpandedState, useToggleExpandFilter } from './hooks';

import { selectCurrentCohortIndexFilters } from './CohortManagment/CohortManagerSelectors';
import { CohortDiscoveryGroup } from './types';
import {
  classifyFacets,
  getAllFieldsFromFilterConfigs,
} from '../../components/facets';
import { TabConfig } from '../CohortBuilder/types';
import { ErrorCard } from '../../components/MessageCards';
import ChartsAndFacetsPanel from './ChartsAndFacetsPanel';
import CohortManager from './CohortManagment/CohortManager';
import { AppState, useAppDispatch, useAppSelector } from './appApi';
import Image from 'next/image';
import {
  addFacetSelection,
  removeFacetSelection,
  selectSelectedFacetsFromIndex,
} from './SelectedFacetsSlice';
import { useUnsecureRoundedAggsQuery } from './queryApi';
import CohortQueryExpression from './CohortQueryExpression';
import { FacetDefinition } from '@gen3/core';

const IndexPanel = ({
  dataConfig,
  tabs,
  tabTitle,
  emptySelection,
  indexResources,
  remoteSupportService,
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
   * This will be changed to use a facet dictionary once that feature is implemented
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
    selectCurrentCohortIndexFilters(state, index),
  );

  const {
    data,
    isSuccess,
    isLoading: isAggsQueryFetching,
    isError: isAggsQueryError,
  } = useUnsecureRoundedAggsQuery(
    {
      type: index,
      fields: fields,
      filters: cohortFilters,
    },
    { skip: fields.length === 0 },
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
      <CohortQueryExpression index={index} />
      <Flex wrap="nowrap" className="flex h-full bg-base-light pb-4 ml-4">
        <FacetSelectionPanel
          categories={categories}
          selectedFields={selectedFacets}
          updateSelectedField={updateFields}
          hooks={{
            useClearFilter: () => (field: string) => null,
            useToggleExpandFilter: useToggleExpandFilter,
            useFilterExpanded: useFilterExpandedState,
            useFieldNameToTitle: () => (field: string) => field,
          }}
        />
        <Stack className="w-full md:w-[40rem] lg:w-[50rem] xl:w-[60rem] mr-2 min-h-[500px]">
          <CohortManager
            indexResources={indexResources}
            remoteSupportService={remoteSupportService}
          />
          {selectedFacets.length > 0 ? (
            <ChartsAndFacetsPanel
              data={data}
              isLoading={isAggsQueryFetching}
              isError={isAggsQueryError}
              isSuccess={isSuccess}
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
