import { NavPageLayoutProps } from '../../features/Navigation';

export interface QueryProps {
    graphQLEndpoint?: string,
}

export interface QueryPageLayoutProps extends NavPageLayoutProps {
    queryProps: QueryProps;
}
