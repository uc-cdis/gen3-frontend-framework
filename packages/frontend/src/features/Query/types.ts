export interface GraphQLEndpoint {
  url: string;
  label: string;
}


export interface GqlQueryEndpointProps {
  graphQLEndpoints?: Array<GraphQLEndpoint>;
}

export interface GqlQueryEditorProps extends GqlQueryEndpointProps {
  buttons?: React.ReactNode;
}

export interface QueryPanelConfiguration {
  graphQLEndpoints?: Array<GraphQLEndpoint>;
  title?: string;
}
