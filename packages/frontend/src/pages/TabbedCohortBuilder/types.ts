import type { NavPageLayoutProps } from '../../features/Navigation';
import { TabbedCohortBuilderConfiguration } from '../../features/CohortBuilder/TabbedCohortBuilder';

export interface TabbedCohortBuilderPageProps extends NavPageLayoutProps {
  configuration: TabbedCohortBuilderConfiguration;
}
