import React, {useState, useEffect} from 'react';
import { Paper, Button, Text, Modal, Grid, Pagination} from '@mantine/core';

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
  const [state, setState] = useState<{
    encounterItems: EncounterEdge[];
    specimenItems: SpecimenEdge[];
    documentItems: DocumentEdge[];
    ModalError: ModalType;
    isLoading: boolean;
    isError: boolean;
    currentPage: number
  }>({
    encounterItems: [],
    specimenItems: [],
    documentItems: [],
    ModalError: {},
    isLoading: true,
    isError: false,
    currentPage: 1
  });


  const fetchEdgeData = async (query: string, headers: Record<string, string>, limit: number, offset: number): Promise<EdgeData> => {
    return gripApiFetch({ query: query, variables: { limit: limit, offset: offset }, endpoint_arg: 'graphql/api' }, headers)
      .then((result: gripApiResponse<EdgeData | unknown | undefined>) => result.data as EdgeData);
  };
  const pageSize = 50;

  const fetchData = async (limit: number, offset: number) => {
    const  headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };
    try {
      const [docResult, encounterResult, specimenResult] = await Promise.all([
        fetchEdgeData(`query PatientIdsWithDocumentEdge($limit: Int, $offset: Int) {
          PatientIdsWithDocumentEdge(limit: $limit, offset: $offset)  {
            id
          }
        }`, headers, limit, offset),
        fetchEdgeData(`query PatientIdsWithEncounterEdge($limit: Int, $offset: Int) {
          PatientIdsWithEncounterEdge(limit: $limit, offset: $offset)  {
            id
          }
        }`, headers, limit, offset),
        fetchEdgeData(`query PatientIdsWithSpecimenEdge($limit: Int, $offset: Int) {
          PatientIdsWithSpecimenEdge(limit: $limit, offset: $offset)  {
            id
          }
        }`, headers, limit, offset)
      ]);
      setState(prevState => ({
        ...prevState,
        encounterItems: encounterResult.PatientIdsWithEncounterEdge ?? [],
        specimenItems: specimenResult.PatientIdsWithSpecimenEdge ?? [],
        documentItems: docResult.PatientIdsWithDocumentEdge ?? [],
        isError: false
      }));
    } catch (error) {
      console.log('ERROR: ', error);
      setState(prevState => ({
        ...prevState,
        ModalError: error ?? {},
        isError: true,
      }));
    } finally {
      setState(prevState => ({
        ...prevState,
        isLoading: false
      }));
    }
  };

  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      isLoading: true,
    }));
    const offset = (state.currentPage - 1) * pageSize;
    fetchData(pageSize, offset);
  }, [state.currentPage]);

  const handlePageChange = (page: number) => {
    setState(prevState => ({
      ...prevState,
      currentPage: page,
      isLoading: true,
    }));
  };

  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <Paper>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {state.isLoading ? (
            <p>Loading data...</p>
          ) : (
            state.isError ? (
              <div>
                <MyModal text={state.ModalError} />
              </div>
            ) : (
              <div>
                <Pagination
                  total={10}
                  value={state.currentPage}
                  onChange={(page: number) => handlePageChange(page)}/>
                <DataComponent data={edgeData} />
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
> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default SamplePage;