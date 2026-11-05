import { NavPageLayoutProps } from '../../features/Navigation';
import { type ClinicalDataConfiguration } from '../../features/ClinicalDataAnalysis/types';

export interface ClinicalDataAnalysisPageProps extends NavPageLayoutProps {
  configuration: ClinicalDataConfiguration;
}
