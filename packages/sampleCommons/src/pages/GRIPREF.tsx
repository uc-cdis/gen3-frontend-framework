import React, {useState, useEffect} from 'react';
import debounce from 'lodash/debounce';
import { Paper, Button, Text, Modal, Grid} from '@mantine/core';

import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';

import {gripApiFetch, gripApiResponse} from '@gen3/core';
import { GetServerSideProps } from 'next';

interface EdgeData {
  //PatientIdsWithObservationEdge?: ObservationEdge[];
  PatientIdsWithEncounterEdge?: EncounterEdge[];
  PatientIdsWithSpecimenEdge?: SpecimenEdge[];
  PatientIdsWithDocumentEdge?: DocumentEdge[];
}

/*interface ObservationEdge {
  id: string;
  type: string;
}*/

interface EncounterEdge {
  id: string;
  type: string;
}

interface SpecimenEdge {
  id: string;
  type: string;
}

interface DocumentEdge {
  id: string;
  type: string;
}
//    ...(data.PatientIdsWithObservationEdge || []).map(item => ({ ...item, type: 'observation' })),

const DataComponent = ({ data }: { data: EdgeData }) => {
  const mergedItems: (EncounterEdge | SpecimenEdge | DocumentEdge)[] = [
    ...(data.PatientIdsWithEncounterEdge || []).map(item => ({ ...item, type: 'encounter' })),
    ...(data.PatientIdsWithSpecimenEdge || []).map(item => ({ ...item, type: 'specimen' })),
    ...(data.PatientIdsWithDocumentEdge || []).map(item => ({ ...item, type: 'document' }))
  ];

  const groupedItems: { [key: string]: { [key: string]: boolean } } = mergedItems.reduce((acc: { [key: string]: any }, item) => {
    if (!acc[item.id]) {
      acc[item.id] = {};
    }
    acc[item.id][item.type] = true;
    return acc;
  }, {});

  const finalItems: ({ id: string; hasEncounter: boolean; hasSpecimen: boolean; hasDocument: boolean })[] = Object.entries(groupedItems).map(([id, types]) => ({
    id,
    //hasObservation: types.observation,
    hasEncounter: types.encounter,
    hasSpecimen: types.specimen,
    hasDocument: types.document
  }));
//              {item.hasObservation && <Text style={{ margin: 10 }}>✅ Observation</Text>}

  return (
    <Grid style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: 20, marginTop: 25, display: 'flex', justifyContent: 'center' }}>
      {finalItems.map(item => (
        <Grid.Col key={item.id} span={5} style={{ marginBottom: 5, marginTop: 5 }}>
          <Paper {...{ children: 'Content', sx: { padding: '10px', shadow: 'xs' } }} >
            <div style={{ display: 'flex', alignItems: 'center' }}>
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

interface ModalType {
  code?: string;
  text?: string;
}

function MyModal({text}: {text?: ModalType}) {
  const [isOpen, setIsOpen] = useState(true);
  const closeModal = () => setIsOpen(false);
  return (
    <React.Fragment>
      <Modal
      opened={isOpen}
      onClose={closeModal}
      title={text ? <p>{text.code ?? ''}, {text.text ?? ''}</p> : null}      >

        <Button onClick={closeModal}>Close</Button>
      </Modal>
    </React.Fragment>
  );
}

const SamplePage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  const [state, setState] = useState({
    //PatientIdsWithObservationEdge: [],
    PatientIdsWithEncounterEdge: [],
    PatientIdsWithSpecimenEdge: [],
    PatientIdsWithDocumentEdge: [],
    isLoading: true,
    isError: false
  });


  const fetchEdgeData = async (query: string): Promise<EdgeData> => {
    return gripApiFetch('graphql/api', { query: query, variables: { limit: 500 } })
      .then((result: gripApiResponse<EdgeData | unknown | undefined>) => result.data as EdgeData);
  };

  useEffect(() => {
    let completedFetches = 0;
    const fetchData = async (): Promise<void> => {
      const updateStateWithFetchResult = (result: any, key: string): void => {
        if (result) {
          console.log("COMPLETED FETCHES: ", completedFetches);
          setState(prevState => ({
            ...prevState,
            [key]: result[key] || [],
            isError: false,
            isLoading: completedFetches >= 2 ? false : true // Disable loading when 4 fetches are complete
          }));
          completedFetches++; // Increment completedFetches after update
        } else {
          setState(prevState => ({
            ...prevState,
            isError: true
          }));
        }
      };
  
      try {
        console.log('i fire once');
        const docResult = await fetchEdgeData(`query PatientIdsWithDocumentEdge($limit: Int) {
          PatientIdsWithDocumentEdge(limit: $limit)  {
            id
          }
        }`);
        console.log('Document Result:', docResult);
        updateStateWithFetchResult(docResult, 'PatientIdsWithDocumentEdge');
      } catch (error) {
        console.log('ERROR fetching document data:', error);
        setState(prevState => ({
          ...prevState,
          isError: true
        }));
      }
  
      try {
        const encounterResult = await fetchEdgeData(`query PatientIdsWithEncounterEdge($limit: Int) {
          PatientIdsWithEncounterEdge(limit: $limit)  {
            id
          }
        }`);
        console.log('Encounter Result:', encounterResult);
        updateStateWithFetchResult(encounterResult, 'PatientIdsWithEncounterEdge');
      } catch (error) {
        console.log('ERROR fetching encounter data:', error);
        setState(prevState => ({
          ...prevState,
          isError: true
        }));
      }
  
      try {
        const specimenResult = await fetchEdgeData(`query PatientIdsWithSpecimenEdge($limit: Int) {
          PatientIdsWithSpecimenEdge(limit: $limit)  {
            id
          }
        }`);
        console.log('Specimen Result:', specimenResult);
        updateStateWithFetchResult(specimenResult, 'PatientIdsWithSpecimenEdge');
      } catch (error) {
        console.log('ERROR fetching specimen data:', error);
        setState(prevState => ({
          ...prevState,
          isError: true
        }));
      }
    };
    const debouncedFetchData = debounce(fetchData, 500); // Debounce with 500ms delay
    debouncedFetchData();
    
  
    //fetchData();
  
    // Dependency array left empty to run only on initial render
  }, []);
  
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
       <Paper>
          <div style={{ display: 'flex', alignItems: 'center' }}>
          {state.isLoading ? (
            <p>Loading data...</p>
            ) : (
                <div>
                  <DataComponent data={state} />
                </div>
              )
            }
          </div>
      </Paper>
    </NavPageLayout>
  );
};

export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default SamplePage;
