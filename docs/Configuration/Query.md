# GraphQL Query Page Configuration

The Query page configuration allows you to add multiple GraphQL endpoints to the GraphQL client.
If there is no query configuration, the default endpoint (guppy) will be used.

To configure a new endpoint, add eadch endpoint as a member of the `endpoints` array:

```json
{
  "graphQLEndpoints": [
    {
      "url": "guppy/graphql",
      "label": "Flat"
    },
    {
      "url": "api/v0/submission/graphql",
      "label": "Graph"
    }
  ]
}
```

The url is the relative path to the GraphQL endpoint. The label is the name of the endpoint as shown in the selector.

The default endpoint is always the first element in the array.

If there is only one endpoint, the selector will not be shown.
