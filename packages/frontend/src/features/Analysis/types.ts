import { ReactElement } from 'react';

export interface AnalysisToolConfiguration {
  title: string;
  image?: string; // URL to image
  icon: string | ReactElement; // URL, IconName as string, ReactElement
  type: string;
  description: string;
  hasDemo?: boolean;
  loginRequired: boolean;
  href: string;
  count?: number; // TODO replace with function
  countUnits?: string;
  cardType?: 'regular' | 'compact';
  btnText?: string;
}

export interface AnalysisCenterConfiguration {
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
