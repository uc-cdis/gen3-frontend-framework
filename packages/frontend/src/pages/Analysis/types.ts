import { NavPageLayoutProps } from '../../features/Navigation';
import { type AnalysisToolConfig } from '../../features/Analysis/types';

export interface AnalysisPageLayoutProps extends NavPageLayoutProps {
  analysis: Array<AnalysisToolConfig>;
}
