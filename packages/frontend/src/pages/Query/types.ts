import { NavPageLayoutProps } from '../../components/Navigation';

export interface QueryProps {
    graphQLEndpoint?: string,
}

export interface QueryPageLayoutProps extends NavPageLayoutProps {
    queryProps: QueryProps;
}
