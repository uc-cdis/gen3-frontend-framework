import { gripApi } from './gripApi';
import { JSONObject } from '../../types';


interface gripApiResponse<H = JSONObject> {
    readonly data: H;
    readonly errors: Record<string, string>;
}

interface EdgeData {
    PatientIdsWithEncounterEdge?: EncounterEdge[];
    PatientIdsWithSpecimenEdge?: SpecimenEdge[];
    PatientIdsWithDocumentEdge?: DocumentEdge[];
}
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

const gripexplorerApi = gripApi.injectEndpoints({
    endpoints: (builder) => ({
      getAllPatientIdsWithEncounterEdge: builder.query({
        query: (limit: number) => ({
          query: `query PatientIdsWithEncounterEdge($limit: Int) {
            PatientIdsWithEncounterEdge(limit: $limit) {
              id
            }
          }`,
          variables: { limit },
          endpoint_arg: 'graphql/api',
        }),
        transformResponse: (response: gripApiResponse<EdgeData>) => {
            if (response.data){
                return response.data;
            } else {
                return ;
            }
        },
      }),
      getAllPatientIdsWithSpecimenEdge: builder.query({
        query: (limit: number) => ({
          query: `query PatientIdsWithSpecimenEdge($limit: Int) {
            PatientIdsWithSpecimenEdge(limit: $limit) {
              id
            }
          }`,
          variables: { limit },
          endpoint_arg: 'graphql/api',
        }),
        transformResponse: (response: gripApiResponse<EdgeData>) => {
            if (response.data){
                return response.data;
            } else {
                return [];
            }
        },
      }),
      getAllPatientIdsWithDocumentEdge: builder.query({
        query: (limit: number) => ({
          query: `query PatientIdsWithDocumentEdge($limit: Int) {
            PatientIdsWithDocumentEdge(limit: $limit) {
              id
            }
          }`,
          variables: { limit },
          endpoint_arg: 'graphql/api',
        }),
        transformResponse: (response: gripApiResponse<EdgeData>) => {
            if (response.data){
                return response.data;
            } else {
                return [];
            }
        },
      }),

    }),
  });

export const {
    useGetAllPatientIdsWithEncounterEdgeQuery,
    useGetAllPatientIdsWithSpecimenEdgeQuery,
    useGetAllPatientIdsWithDocumentEdgeQuery
} = gripexplorerApi