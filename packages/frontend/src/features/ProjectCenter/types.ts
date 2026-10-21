import { DataDownloadLinks, DownloadLinkFields, StudyDetailsField, TagsConfig } from '../Study/types';
import { Gen3AppConfigData } from '../../lib/content/types';
import { SearchConfig, DiscoveryPageTitle, AdvancedSearchFilters, MinimalFieldMapping } from '../Discovery/types';
import { DataAuthorization } from '../../utils';
import { SummaryStatisticsConfig } from '../Discovery/Statistics/types';

interface projectPageTagsConfig extends TagsConfig {
  title?: string;
}

export interface ProjectCenterDetailsConfig {
  showAllAvailableFields?: boolean;
  header?: {
    field: string;
    className?: string;
  };
  downloadLinks?: DataDownloadLinks;
  downloadLinkFields?: DownloadLinkFields;
  dataTableFields: StudyDetailsField[];
  rightOfTableFields: StudyDetailsField[];
  tags?: projectPageTagsConfig;
}
export interface ProjectCenterIndexConfig {
  guidType?: string;
  studyField?: string;
  maxStudies?: number;
  label?: string;
  tabType?: 'pills' | 'outline';
  features: {
    advSearchFilters?: AdvancedSearchFilters;
    pageTitle: DiscoveryPageTitle;
    search?: SearchConfig;
    authorization: DataAuthorization;
  };
  aggregations: SummaryStatisticsConfig[];
  tags?: TagsConfig; // categories listed in the tag filter dropdown
  studyPreviewField?: StudyDetailsField;
  detailsView?: ProjectCenterDetailsConfig;
  minimalFieldMapping: MinimalFieldMapping;
}


export interface ProjectCenterConfig extends Gen3AppConfigData {
  metadataConfig: Array<ProjectCenterIndexConfig>;
}
