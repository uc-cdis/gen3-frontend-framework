import { Fetcher } from "@graphiql/toolkit";
import { GEN3_API } from "@gen3/core";
import { GqlQueryEndpointProps } from "./types";

const fetcher: Fetcher = async ({ graphQLEndpoint } : GqlQueryEndpointProps) => {
  const data = await fetch(graphQLEndpoint || `${GEN3_API}/graphql`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(graphQLParams),
  });
  return data.json().catch(() => data.text());
};
