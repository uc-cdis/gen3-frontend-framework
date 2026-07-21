import { NavPageLayoutProps } from '../../features/Navigation';
import {
  type AnalysisCenterSection,
  type AnalysisToolConfiguration,
} from '../../features/Analysis/types';

export interface AnalysisPageLayoutProps extends NavPageLayoutProps {
  tools?: Array<AnalysisToolConfiguration>;
  sections?: Array<AnalysisCenterSection>;
  classNames?: Record<string, string>;
  type?: 'section' | 'breadcrumb';
}
