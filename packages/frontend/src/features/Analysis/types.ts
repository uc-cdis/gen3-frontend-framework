import  { ReactElement } from 'react';
import { Gen3AppConfigData } from '../../lib/content/types';


export interface AnalysisToolConfiguration {
  title: string;
  image?: string; // URL to image
  icon: string | ReactElement; // URL, IconName as string, ReactElement
  type: string;
  description: string;
  hasDemo?: boolean;
  loginRequired: boolean;
  href: string;
  appId?: string;
  count?: number; // TODO replace with function
  countIndex?: string;
  countUnits?: string;
  noDataTooltip?: string;
  cardType?: 'regular' | 'compact';
  btnText?: string;
  tags?: Array<string>;
  readonly rightComponent?: React.FC;
  readonly selectionScreen?: React.FC;
}

export interface AnalysisCenterConfiguration extends Gen3AppConfigData {
  tools: Array<AnalysisToolConfiguration>;
  showFilterAndSort?: boolean;
}

export interface AnalysisCenterSection {
  label: string;
  classNames?: Record<string, string>;
  tools: Array<AnalysisToolConfiguration>;
}

export interface AnalysisCenterWithSectionsConfiguration {
  sections: Array<AnalysisCenterSection>;
  classNames?: Record<string, string>;
}

export const isAnalysisCenterWithSectionsConfiguration = (
  value: unknown,
): value is AnalysisCenterWithSectionsConfiguration => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  // Check that sections exists and is an array
  if (!Array.isArray(candidate.sections)) {
    return false;
  }

  for (const section of candidate.sections) {
    if (
      !section ||
      typeof section !== 'object' ||
      typeof (section as AnalysisCenterSection).label !== 'string' ||
      !Array.isArray((section as AnalysisCenterSection).tools)
    ) {
      return false;
    }
  }
  return true;
};
