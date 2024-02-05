import { FilterSet, GQLFilter } from '../filters';
import { Accessibility } from '../../constants';

export interface BaseGuppyDownloadRequest {
  type: string;
  accessibility?: Accessibility;
  fields?: string[];
  sort?: string[];
  format?: string;
}

export interface GuppyDownloadQueryParams extends BaseGuppyDownloadRequest {
  filters: FilterSet;
}

export interface GuppyDownloadRequestParams extends BaseGuppyDownloadRequest {
  readonly filter: GQLFilter;
}
