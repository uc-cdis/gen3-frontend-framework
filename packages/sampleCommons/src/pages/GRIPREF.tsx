import React, {useState, useEffect, useMemo, useRef} from 'react';
import { Paper, Button, Text, Modal, Grid} from '@mantine/core';

import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';

import {gripApiFetch, JSONObject} from '@gen3/core';
import { GetServerSideProps } from 'next';
import * as echarts from 'echarts';
import type {ECharts} from 'echarts'

const DataComponent = ({ data }) => {
  // Merge all lists into a single array
  const mergedItems = [
    ...(data.observationItems || []).map(item => ({ ...item, type: 'observation' })),
    ...(data.encounterItems || []).map(item => ({ ...item, type: 'encounter' })),
    ...(data.specimenItems || []).map(item => ({ ...item, type: 'specimen' })),
    ...(data.documentItems || []).map(item => ({ ...item, type: 'document' }))
  ];

  // Group items by their IDs
  const groupedItems = mergedItems.reduce((acc, item) => {
    const id = item.id;
    if (!acc[id]) {
      acc[id] = {};
    }
    acc[id][item.type] = true;
    return acc;
  }, {});

  // Convert the object of grouped items back to an array
  const finalItems = Object.entries(groupedItems).map(([id, types]) => ({
    id,
    hasObservation: types.observation,
    hasEncounter: types.encounter,
    hasSpecimen: types.specimen,
    hasDocument: types.document
  }));

  return (
    <Grid style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: 20, marginTop: 25, display: 'flex', justifyContent: 'center' }}>
      {finalItems.map(item => (
        <Grid.Col key={item.id} span={5} style={{ marginBottom: 5, marginTop: 5 }}>
          <Paper padding="lg" shadow="xs">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {item.hasObservation && <Text style={{ margin: 10 }}>✅ Observation</Text>}
              {item.hasEncounter && <Text style={{ margin: 10 }}>✅ Encounter</Text>}
              {item.hasSpecimen && <Text style={{ margin: 10 }}>✅ Specimen</Text>}
              {item.hasDocument && <Text style={{ margin: 10 }}>✅ DocumentReference</Text>}
              <div>
                <div>{item.id}</div>
              </div>
            </div>
          </Paper>
        </Grid.Col>
      ))}
    </Grid>
  );
};


function MyModal({text}) {
  const [isOpen, setIsOpen] = useState(true);
  const closeModal = () => setIsOpen(false);
  return (
    <>
      <Modal
      opened={isOpen}
      onClose={closeModal}
      title={<p>{text.code}, {text.text}</p>}
      >

        <Button onClick={closeModal}>Close</Button>
      </Modal>
    </>
  );
}

const SamplePage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  const [state, setState] = useState({
    observationItems: [],
    encounterItems: [],
    specimenItems: [],
    documentItems: [],
    isLoading: true,
    isError: false
  });

  const fetchEdgeData = async (query: string) => {
    //const variables = { limit: 1000 };
    try {
      const result = await gripApiFetch("graphql/api", {query:query, variables:{ limit: 2000 } });
      return result.data;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          docResult,
          obsResult,
          encounterResult,
          specimenResult
        ] = await Promise.all([
          fetchEdgeData(`query PatientIdsWithDocumentEdge($limit: Int) {
            PatientIdsWithDocumentEdge(limit: $limit)  {
              id
            }
          }`),
          fetchEdgeData(`query PatientIdsWithObservationEdge($limit: Int) {
            PatientIdsWithObservationEdge(limit: $limit)  {
              id
            }
          }`),
          fetchEdgeData(`query PatientIdsWithEncounterEdge($limit: Int) {
            PatientIdsWithEncounterEdge(limit: $limit)  {
              id
            }
          }`),
          fetchEdgeData(`query PatientIdsWithSpecimenEdge($limit: Int) {
            PatientIdsWithSpecimenEdge(limit: $limit)  {
              id
            }
          }`)
        ]);

        console.log("Document Result:", docResult);
        console.log("Observation Result:", obsResult);
        console.log("Encounter Result:", encounterResult);
        console.log("Specimen Result:", specimenResult);

        setState({
          observationItems: obsResult.PatientIdsWithObservationEdge,
          encounterItems: encounterResult.PatientIdsWithEncounterEdge,
          specimenItems: specimenResult.PatientIdsWithSpecimenEdge,
          documentItems: docResult.PatientIdsWithDocumentEdge,
          isError: false
        });
      } catch (error) {
        console.log("ERROR: ", error)
        setState(prevState => ({
          ...prevState,
          isError: true
        }));
      } finally {
        setState(prevState => ({
          ...prevState,
          isLoading: false
        }));
      }
    };
    setState(prevState => ({
      ...prevState,
      isLoading: true
    }));
    fetchData();
  }, []);

  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
       <Paper>
          <div style={{ display: 'flex', alignItems: 'center' }}>
          {state.isLoading ? (
            <p>Loading data...</p>
            ) : (
              state.isError ? (
                <div>
                  <MyModal text={state.isError}/>
                </div>
              ) : (
                <div>
                  <DataComponent data={state} />
                </div>
              )
            )}
          </div>
      </Paper>
    </NavPageLayout>
  );
};

export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async (_context) => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default SamplePage;
