import React, { ReactElement } from 'react';
import { Gen3AppConfigData } from '../../lib/content/types';
import { StylingOverrideWithMergeControl } from '../../types';

type CountFunction = () => string;

export interface CardTitleAndHRef {
  title: string;
  href?: string;
}

export type AnalysisCardSelectionFunction = (
  tool: CardTitleAndHRef | null,
) => void;

export interface AnalysisToolConfiguration {
  title: string;
  image?: string; // URL to image
  icon?: string | ReactElement; // URL, IconName as string, ReactElement
  type?: string;
  description: string;
  hasDemo?: boolean;
  loginRequired: boolean;
  href: string;
  demoHref?: string;
  appId?: string; // id of the app
  componentName?: string; // Name of component to load
  count?: number; // TODO replace with function
  countFunction?: CountFunction;
  countIndex?: string;
  countUnits?: string;
  hideCounts?: boolean;
  noDataTooltip?: string;
  cardType?: 'regular' | 'compact';
  btnText?: string;
  /**
   * Optional handler for the primary action button. When provided, the button
   * behaves as an action (calls this handler on click) instead of navigating
   * to `href`. Must be injected by a parent, not from JSON config.
   */
  onButtonClick?: AnalysisCardSelectionFunction;
  tags?: Array<string>;
  readonly leftComponent?: React.FC;
  readonly rightComponent?: React.FC;
  readonly selectionScreen?: React.FC;
  classNames?: StylingOverrideWithMergeControl;
  height?: string;
}

export interface AnalysisCenterConfiguration extends Gen3AppConfigData {
  tools: Array<AnalysisToolConfiguration>;
  showFilterAndSort?: boolean;
  onButtonClick?: AnalysisCardSelectionFunction; // Default handler for all cards
  label?: string;
  description?: string;
}

export interface AnalysisCenterSection {
  label: string;
  classNames?: Record<string, string>;
  tools: Array<AnalysisToolConfiguration>;
  core?: boolean;
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
