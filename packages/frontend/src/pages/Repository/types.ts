import { NavPageLayoutProps } from '../../features/Navigation';
import { RepositoryConfiguration } from '../../features/CohortBuilder/Repository/types';

export interface RepositoryPageProps extends NavPageLayoutProps {
  configuration?: RepositoryConfiguration;
}
