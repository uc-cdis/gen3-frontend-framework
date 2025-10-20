import { NavPageLayoutProps } from '../../features/Navigation';
import { Gen3AppConfigData } from '../../lib/content/types';

export interface QueryProps extends Gen3AppConfigData {
  graphQLEndpoint?: string;
}

export interface QueryPageLayoutProps extends NavPageLayoutProps {
  queryProps: QueryProps;
}
