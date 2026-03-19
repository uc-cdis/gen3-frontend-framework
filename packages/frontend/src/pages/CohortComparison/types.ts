import { NavPageLayoutProps } from '../../features/Navigation';
import { type CohortComparisonConfiguration } from '../../features/CohortComparison/types';

export interface CohortComparisonPageProps extends NavPageLayoutProps {
  configuration: CohortComparisonConfiguration;
}
