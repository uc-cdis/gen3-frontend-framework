import { ReactElement } from 'react';

export interface AnalysisToolConfig {
  title: string;
  image?: string; // URL to image
  icon: string | ReactElement; // URL, IconName as string, ReactElement
  type: string;
  description: string;
  hasDemo?: boolean;
  loginRequired: boolean;
  href: string;
}

export interface AnalysisCenterConfiguration {
  tools: Array<AnalysisToolConfig>;
}
