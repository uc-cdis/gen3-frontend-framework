import { NavPageLayoutProps } from '../../features/Navigation';
import {
  type AnalysisToolConfiguration,
  type AnalysisCenterSection,
} from '../../features/Analysis/types';

export interface AnalysisPageLayoutProps extends NavPageLayoutProps {
  tools?: Array<AnalysisToolConfiguration>;
  sections?: Array<AnalysisCenterSection>;
  classNames?: Record<string, string>;
}
