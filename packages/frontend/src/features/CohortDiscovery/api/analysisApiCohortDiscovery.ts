import type { NextApiRequest, NextApiResponse } from 'next';
import { GEN3_GUPPY_API, fetchJSONDataFromURL, HTTPError } from '@gen3/core';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  // Ensure this API route only accepts POST requests

  console.log(req.method);

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
      GEN3_GUPPY_API,
      true,
      'POST',
      JSON.stringify({ query, variables }),
    );
    // Parse and return the response as JSON
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
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
