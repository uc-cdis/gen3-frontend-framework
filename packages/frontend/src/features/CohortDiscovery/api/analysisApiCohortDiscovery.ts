import type { NextApiRequest, NextApiResponse } from 'next';
import {
  fetchJSONDataFromURL,
  GEN3_GUPPY_API,
  HTTPError,
  HttpMethod,
  roundHistogramResponse,
} from '@gen3/core';

const COHORT_DISCOVERY_LIMIT = process.env.GEN3_COHORT_DISCOVERY_LIMIT
  ? Number(process.env.GEN3_COHORT_DISCOVERY_LIMIT)
  : 100;

export default async function (req: NextApiRequest, res: NextApiResponse) {
  // Ensure this API route only accepts POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed' });
  }

  // Extract the GraphQL query and variables from the request body
  const { query, variables } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'GraphQL query is required' });
  }

  try {
    // Make the POST request to the GraphQL endpoint
    const response = await fetchJSONDataFromURL(
      `${GEN3_GUPPY_API}/graphql`,
      true,
      HttpMethod.POST,
      JSON.stringify({ query, variables }),
    );
    // Parse and return the response as JSON
    const data: Record<string, unknown> = response as Record<string, unknown>;

    // redact data that is less than the rounding.
    const redactedData = roundHistogramResponse(data, COHORT_DISCOVERY_LIMIT);

    res.status(200).json(redactedData);
  } catch (error) {
    console.error('CohortDiscovery API', error);
    if (error instanceof HTTPError)
      res
        .status(error.status)
        .json({ error: 'HTTP Error', details: error.message });
    // Handle any network or unexpected errors
    else if (error instanceof Error)
      res
        .status(500)
        .json({ error: 'Internal Server Error', details: error.message });
    else
      res
        .status(500)
        .json({ error: 'Internal Server Error', details: 'Unknown error' });
  }
}
