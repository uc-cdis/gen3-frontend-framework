import useSWR from 'swr';
import {
  Accessibility,
  GuppyAggregationsResponse,
  buildGetAggregationQuery,
  FilterSet,
  GraphQLQuery,
  processHistogramResponse,
} from '@gen3/core';
import { getCookie } from 'cookies-next';

interface ErrorDetails {
  status: string;
  message: string;
  error: ErrorDetails | null;
}

export const useGraphQLData = <TResponse = unknown, TBody = unknown>(
  url: string,
  body: TBody,
  skip?: boolean,
) => {
  // Create a fetcher function that handles the GraphQL POST request
  const fetcher = async (fetchUrl: string, fetchBody: TBody) => {
    const headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    if (process.env.NODE_ENV === 'development') {
      // NOTE: This cookie can only be accessed from the client side
      // in development mode. Otherwise, the cookie is set as httpOnly
      const accessToken = getCookie('credentials_token');
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
    }

    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(fetchBody),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  };

  // Use SWR with the fetcher
  const { data, error, isLoading, mutate } = useSWR<TResponse, Error>(
    !skip ? [url, body] : null,
    ([fetchUrl, fetchBody]) => fetcher(fetchUrl, fetchBody as TBody),
    {
      revalidateOnFocus: false, // Disable auto revalidation on window focus
      // Add any other SWR options you need here
    },
  );

  // Format error to match your ErrorDetails interface
  const formattedError = error
    ? ({
        status: error.message.match(/\d+/)?.[0] || 'Unknown',
        message: error.message,
      } as ErrorDetails)
    : null;

  return {
    data,
    isLoading,
    isSuccess: !!data && !error,
    isError: !!error,
    error: formattedError,
    mutate, // Allow manual revalidation if needed
  };
};

interface QueryAggsParams {
  type: string;
  fields: ReadonlyArray<string>;
  filters: FilterSet;
  accessibility?: Accessibility;
}

interface QueryOptions {
  skip?: boolean;
}

export const useRoundedAggsQuery = (
  { type, fields, filters, accessibility = Accessibility.ALL }: QueryAggsParams,
  { skip }: QueryOptions = { skip: false },
) => {
  const response = useGraphQLData<
    { data: GuppyAggregationsResponse },
    GraphQLQuery
  >(
    '/api/analysis/cohortDiscovery',
    buildGetAggregationQuery(type, fields, filters, accessibility, false),
    skip,
  );

  return {
    ...response,
    data: response?.data?.data
      ? processHistogramResponse(response?.data.data?._aggregation[type] ?? {})
      : {},
  };
};
