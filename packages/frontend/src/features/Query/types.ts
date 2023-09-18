

export interface GqlQueryEndpointProps {
  graphQLEndpoint?: string;
}

export interface GqlQueryEditorProps extends GqlQueryEndpointProps {
  buttons?: React.ReactNode;
}
