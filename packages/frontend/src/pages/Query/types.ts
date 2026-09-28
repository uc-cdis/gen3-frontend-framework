import { NavPageLayoutProps } from '../../features/Navigation';
import { Gen3AppConfigData } from '../../lib/content/types';
import { QueryPanelConfiguration } from '../../features/Query/types';

export type QueryConfiguration = QueryPanelConfiguration & Gen3AppConfigData;

export interface QueryPageLayoutProps extends NavPageLayoutProps {
  configuration: QueryConfiguration;
}
