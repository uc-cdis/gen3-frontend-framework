import { JSONObject } from '../../types';
import { GEN3_GRIP_API } from '../../constants'
export interface gripApiResponse<H = JSONObject> {
  readonly data: H;
}

export interface gripApiSliceRequest {
  readonly query: string;
  readonly variables?: Record<string, unknown>;
}

export const gripApiFetch = async <T>(
  query: gripApiSliceRequest
): Promise<gripApiResponse<T>> => {
  //console.log("VARIABLES: ", query.variables)

  const res = await fetch(`${GEN3_GRIP_API}/${endpoint_arg}`, {
    headers: {
      Accept: 'application/json',
      'Content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    method: 'POST',
    body: JSON.stringify(query),
  });

  if (res.ok) return res.json();

  throw await buildGripFetchError(res);
};

const buildGripFetchError = async (
  res: Response,
): Promise<Object> => {
  const errorData = await res.json();
  return {
    text: errorData.Message,
    code: errorData.StatusCode
  };
};


/* Define a service using a base URL and expected endpoints
export const gripApi = gen3Api.injectEndpoints({
    endpoints: (builder) => ({
        GetGrip: builder.query<JSONObject, JSONObject>({
          query: (graphQLParams) => ({
            url: `${GEN3_API}/grip/graphql`,
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            method: 'POST',
            body: JSON.stringify(graphQLParams),
          }),
        }),
      }),
});

export const { useGetGripQuery} = gripApi;
*/