import { guppyApi } from '../guppy/guppyApi';

const graphQLQuery = `
  query CDaveFields {
    introspectiveType: __type(name: "ExploreCases") {
      name
      fields {
        name
        description
        type {
          name
          fields {
            name
            description
            type {
              name
            }
          }
        }
      }
    }
  }
`;

interface CDaveField {
  readonly description?: string;
  readonly name: string;
}

const clinicalFieldsAPISlice = guppyApi.injectEndpoints({
  endpoints: (builder) => ({
    clinicalFields: builder.query<CDaveField[], void>({
      query: () => ({
        query: graphQLQuery,
        variables: {},
      }),
      transformResponse: (response) =>
        response.data.introspectiveType.fields[1].type.fields,
    }),
  }),
});

export const { useClinicalFieldsQuery } = clinicalFieldsAPISlice;
